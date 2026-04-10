import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

type ParamId = { id: string };

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── GET /api/videos ───────────────────────────────────────────────────────────
// Lista videos. Acepta ?artistId=xxx y ?active=true para filtrar.
router.get("/", async (req: Request, res: Response) => {
  try {
    const { artistId, active, type } = req.query as {
      artistId?: string;
      active?: string;
      type?: string;
    };

    const where: Record<string, unknown> = {};
    if (artistId) where.artistId = artistId;
    if (active === "true") where.active = true;
    if (active === "false") where.active = false;
    if (type) where.type = type;

    const videos = await prisma.video.findMany({
      where,
      include: {
        artist: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    res.json({ videos, total: videos.length });
  } catch (err) {
    console.error("[VIDEOS] Error listando videos:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo videos",
    });
  }
});

// ─── POST /api/videos ─────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      youtubeId,
      artistId,
      type = "mv",
      order = 0,
    } = req.body as {
      title?: string;
      youtubeId?: string;
      artistId?: string;
      type?: string;
      order?: number;
    };

    if (!title || !youtubeId || !artistId) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "title, youtubeId y artistId son requeridos",
      });
      return;
    }

    // Verificar que el artista exista
    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Artista no encontrado",
      });
      return;
    }

    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        youtubeId: youtubeId.trim(),
        artistId,
        type,
        order,
      },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({
      message: "Video creado correctamente",
      video,
    });
  } catch (err) {
    console.error("[VIDEOS] Error creando video:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error creando video",
    });
  }
});

// ─── PUT /api/videos/:id ───────────────────────────────────────────────────────
router.put("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Video no encontrado",
      });
      return;
    }

    const allowedFields = ["title", "youtubeId", "type", "order", "active", "artistId"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({
      message: "Video actualizado correctamente",
      video,
    });
  } catch (err) {
    console.error("[VIDEOS] Error actualizando video:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando video",
    });
  }
});

// ─── DELETE /api/videos/:id ────────────────────────────────────────────────────
router.delete("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Video no encontrado",
      });
      return;
    }

    await prisma.video.delete({ where: { id: req.params.id } });

    res.json({ message: "Video eliminado correctamente" });
  } catch (err) {
    console.error("[VIDEOS] Error eliminando video:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error eliminando video",
    });
  }
});

export default router;
