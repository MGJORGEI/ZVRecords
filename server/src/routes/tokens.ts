import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

type ParamId = { id: string };

const router = Router();
const prisma = new PrismaClient();

// Todos los endpoints de tokens requieren auth
router.use(authMiddleware);

// ─── Helper: genera un token seguro tipo "zvt_<uuid_sin_guiones>" ──────────────
function generateApiToken(): string {
  const raw = uuid().replace(/-/g, "");
  return `zvt_${raw}`;
}

// ─── GET /api/tokens ───────────────────────────────────────────────────────────
// Lista todos los tokens. NUNCA devuelve el token completo — solo los últimos 8 chars.
// Esto es un patrón estándar de seguridad (GitHub, Stripe, etc. hacen lo mismo).
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tokens = await prisma.apiToken.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enmascarar el token — solo mostramos sufijo para identificación visual
    const safeTokens = tokens.map((t) => ({
      id: t.id,
      name: t.name,
      tokenSuffix: `...${t.token.slice(-8)}`,
      createdBy: t.createdBy,
      active: t.active,
      lastUsed: t.lastUsed,
      createdAt: t.createdAt,
    }));

    res.json({ tokens: safeTokens, total: safeTokens.length });
  } catch (err) {
    console.error("[TOKENS] Error listando tokens:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo tokens",
    });
  }
});

// ─── POST /api/tokens ──────────────────────────────────────────────────────────
// Genera nuevo API token. El token completo SOLO se devuelve en esta respuesta.
// Después nunca más lo verás — si lo pierdes, genera uno nuevo.
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };

    if (!name || name.trim().length === 0) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "name es requerido para identificar el token",
      });
      return;
    }

    const token = generateApiToken();

    const tokenRecord = await prisma.apiToken.create({
      data: {
        name: name.trim(),
        token,
        createdBy: req.user!.id,
        active: true,
      },
    });

    // Esta es la ÚNICA vez que devolvemos el token completo
    res.status(201).json({
      message: "API token generado. Guárdalo bien — no lo podrás ver de nuevo.",
      token: {
        id: tokenRecord.id,
        name: tokenRecord.name,
        token, // Token completo — SOLO en esta respuesta
        createdAt: tokenRecord.createdAt,
      },
    });
  } catch (err) {
    console.error("[TOKENS] Error generando token:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error generando token",
    });
  }
});

// ─── DELETE /api/tokens/:id ────────────────────────────────────────────────────
// Revoca el token (soft delete: active=false).
// No borramos el registro para mantener auditoría de quién generó qué.
router.delete("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.apiToken.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Token no encontrado",
      });
      return;
    }

    if (!existing.active) {
      res.status(409).json({
        error: "CONFLICT",
        message: "El token ya estaba revocado",
      });
      return;
    }

    await prisma.apiToken.update({
      where: { id: req.params.id },
      data: { active: false },
    });

    res.json({ message: "Token revocado correctamente" });
  } catch (err) {
    console.error("[TOKENS] Error revocando token:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error revocando token",
    });
  }
});

export default router;
