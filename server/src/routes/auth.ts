import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  generateToken,
  hashPassword,
  comparePassword,
} from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
// Login público. Devuelve JWT válido por 7 días.
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "username y password son requeridos",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!user) {
      // Mismo mensaje para user no encontrado y password incorrecta
      // (no revelamos si el usuario existe o no — seguridad básica)
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Credenciales incorrectas",
      });
      return;
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Credenciales incorrectas",
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[AUTH] Error en login:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
});

// ─── POST /api/auth/register ───────────────────────────────────────────────────
// Solo admins autenticados pueden crear nuevos usuarios.
// No hay registro público — ZV Records es un sistema cerrado.
router.post(
  "/register",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { username, password, role = "admin" } = req.body as {
        username?: string;
        password?: string;
        role?: string;
      };

      if (!username || !password) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "username y password son requeridos",
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "La contraseña debe tener al menos 8 caracteres",
        });
        return;
      }

      // Verificar que no exista el usuario
      const existing = await prisma.user.findUnique({
        where: { username: username.trim().toLowerCase() },
      });

      if (existing) {
        res.status(409).json({
          error: "CONFLICT",
          message: "El username ya está en uso",
        });
        return;
      }

      const hashedPwd = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          username: username.trim().toLowerCase(),
          password: hashedPwd,
          role: role === "admin" ? "admin" : "viewer",
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        message: "Usuario creado correctamente",
        user: newUser,
      });
    } catch (err) {
      console.error("[AUTH] Error en register:", err);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Error interno del servidor",
      });
    }
  }
);

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
// Devuelve info del usuario autenticado. Útil para el admin panel al cargar.
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Usuario no encontrado",
      });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("[AUTH] Error en /me:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
    });
  }
});

export default router;
