import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/popup ────────────────────────────────────────────────────────────
// El popup config es un singleton con id="singleton" en la DB.
// GET es público — el frontend lo necesita para mostrar el popup.
router.get("/", async (_req: Request, res: Response) => {
  try {
    // upsert garantiza que el singleton siempre exista
    const popup = await prisma.popupConfig.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });

    res.json({ popup });
  } catch (err) {
    console.error("[POPUP] Error obteniendo popup config:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo configuración del popup",
    });
  }
});

// ─── PUT /api/popup ────────────────────────────────────────────────────────────
// Actualiza el singleton. Requiere auth.
router.put("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const allowedFields = [
      "enabled",
      "title",
      "artistName",
      "cover",
      "label",
      "listenUrl",
      "badgeText",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // upsert: si por alguna razón no existe el singleton, lo crea
    const popup = await prisma.popupConfig.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...updateData },
      update: updateData,
    });

    res.json({
      message: "Popup actualizado correctamente",
      popup,
    });
  } catch (err) {
    console.error("[POPUP] Error actualizando popup:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando popup",
    });
  }
});

export default router;
