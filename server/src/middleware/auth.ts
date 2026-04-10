import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Extend Express Request type ─────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateToken(payload: {
  id: string;
  username: string;
  role: string;
}): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not defined in environment");

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function hashPassword(password: string): Promise<string> {
  // Salt rounds = 12: buen balance entre seguridad y velocidad
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT Auth Middleware ───────────────────────────────────────────────────────
// Verifica el Bearer token del header Authorization
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Token de autenticación requerido",
    });
    return;
  }

  const token = authHeader.slice(7); // Quita "Bearer "
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "JWT_SECRET no configurado",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Token inválido o expirado",
    });
  }
}

// ─── API Token Middleware ──────────────────────────────────────────────────────
// Acepta X-API-Token header. Si no hay, cae en JWT auth.
// Esto permite que clientes externos (n8n, scripts) usen API tokens
// mientras el admin panel sigue usando JWT normal.
export async function apiTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiToken = req.headers["x-api-token"] as string | undefined;

  // Si hay API token en el header, validarlo contra la DB
  if (apiToken) {
    try {
      const tokenRecord = await prisma.apiToken.findUnique({
        where: { token: apiToken, active: true },
      });

      if (!tokenRecord) {
        res.status(401).json({
          error: "INVALID_API_TOKEN",
          message: "API token inválido o revocado",
        });
        return;
      }

      // Actualizar lastUsed en background (no bloqueamos la request)
      prisma.apiToken
        .update({
          where: { id: tokenRecord.id },
          data: { lastUsed: new Date() },
        })
        .catch(() => {
          // Si falla el update de lastUsed, no es crítico. Seguimos.
        });

      // Seteamos un user sintético para que el resto de los handlers funcionen igual
      req.user = {
        id: tokenRecord.createdBy,
        username: `api:${tokenRecord.name}`,
        role: "admin",
      };

      next();
      return;
    } catch {
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Error validando API token",
      });
      return;
    }
  }

  // Sin API token → intentar JWT auth normal
  authMiddleware(req, res, next);
}
