import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

type ParamId = { id: string };

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── GET /api/upcoming ─────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const activeFilter = req.query.active as string | undefined;

    const upcoming = await prisma.upcoming.findMany({
      where:
        activeFilter === "true"
          ? { active: true }
          : activeFilter === "false"
            ? { active: false }
            : undefined,
      orderBy: [{ order: "asc" }, { date: "asc" }],
    });

    res.json({ upcoming, total: upcoming.length });
  } catch (err) {
    console.error("[UPCOMING] Error listando upcoming:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo próximos lanzamientos",
    });
  }
});

// ─── POST /api/upcoming ────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      artistName,
      cover = "",
      date,
      order = 0,
    } = req.body as {
      title?: string;
      artistName?: string;
      cover?: string;
      date?: string;
      order?: number;
    };

    if (!title || !artistName || !date) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "title, artistName y date son requeridos",
      });
      return;
    }

    const item = await prisma.upcoming.create({
      data: {
        title: title.trim(),
        artistName: artistName.trim(),
        cover,
        date,
        order,
      },
    });

    res.status(201).json({
      message: "Próximo lanzamiento creado correctamente",
      upcoming: item,
    });
  } catch (err) {
    console.error("[UPCOMING] Error creando upcoming:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error creando próximo lanzamiento",
    });
  }
});

// ─── PUT /api/upcoming/:id ─────────────────────────────────────────────────────
router.put("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.upcoming.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Próximo lanzamiento no encontrado",
      });
      return;
    }

    const allowedFields = ["title", "artistName", "cover", "date", "order", "active"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const item = await prisma.upcoming.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      message: "Próximo lanzamiento actualizado correctamente",
      upcoming: item,
    });
  } catch (err) {
    console.error("[UPCOMING] Error actualizando upcoming:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando próximo lanzamiento",
    });
  }
});

// ─── DELETE /api/upcoming/:id ──────────────────────────────────────────────────
router.delete("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.upcoming.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Próximo lanzamiento no encontrado",
      });
      return;
    }

    await prisma.upcoming.delete({ where: { id: req.params.id } });

    res.json({ message: "Próximo lanzamiento eliminado correctamente" });
  } catch (err) {
    console.error("[UPCOMING] Error eliminando upcoming:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error eliminando próximo lanzamiento",
    });
  }
});

export default router;
