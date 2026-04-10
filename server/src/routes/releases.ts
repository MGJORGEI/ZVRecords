import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

type ParamId = { id: string };

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ─── GET /api/releases ─────────────────────────────────────────────────────────
// Lista todos los releases con info del artista incluida.
// Acepta ?artistId=xxx para filtrar por artista, ?active=true para activos.
router.get("/", async (req: Request, res: Response) => {
  try {
    const { artistId, active } = req.query as {
      artistId?: string;
      active?: string;
    };

    const where: Record<string, unknown> = {};
    if (artistId) where.artistId = artistId;
    if (active === "true") where.active = true;
    if (active === "false") where.active = false;

    const releases = await prisma.release.findMany({
      where,
      include: {
        artist: {
          select: { id: true, name: true, slug: true, image: true },
        },
      },
      orderBy: [{ order: "asc" }, { date: "desc" }],
    });

    res.json({ releases, total: releases.length });
  } catch (err) {
    console.error("[RELEASES] Error listando releases:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo releases",
    });
  }
});

// ─── POST /api/releases ────────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      artistId,
      type = "single",
      cover = "",
      date,
      spotify = "",
      appleMusic = "",
      youtubeMusic = "",
      featured = false,
      order = 0,
    } = req.body as {
      title?: string;
      artistId?: string;
      type?: string;
      cover?: string;
      date?: string;
      spotify?: string;
      appleMusic?: string;
      youtubeMusic?: string;
      featured?: boolean;
      order?: number;
    };

    if (!title || !artistId || !date) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "title, artistId y date son requeridos",
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

    const release = await prisma.release.create({
      data: {
        title: title.trim(),
        artistId,
        type,
        cover,
        date,
        spotify,
        appleMusic,
        youtubeMusic,
        featured,
        order,
      },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({
      message: "Release creado correctamente",
      release,
    });
  } catch (err) {
    console.error("[RELEASES] Error creando release:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error creando release",
    });
  }
});

// ─── PUT /api/releases/:id ─────────────────────────────────────────────────────
router.put("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.release.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Release no encontrado",
      });
      return;
    }

    const allowedFields = [
      "title",
      "type",
      "cover",
      "date",
      "spotify",
      "appleMusic",
      "youtubeMusic",
      "featured",
      "order",
      "active",
      "artistId",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const release = await prisma.release.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({
      message: "Release actualizado correctamente",
      release,
    });
  } catch (err) {
    console.error("[RELEASES] Error actualizando release:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando release",
    });
  }
});

// ─── DELETE /api/releases/:id ──────────────────────────────────────────────────
// Hard delete aquí — los releases se borran de verdad si el admin lo pide.
// Si el artista se borra (cascade en schema), los releases van con él.
router.delete("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.release.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Release no encontrado",
      });
      return;
    }

    await prisma.release.delete({ where: { id: req.params.id } });

    res.json({ message: "Release eliminado correctamente" });
  } catch (err) {
    console.error("[RELEASES] Error eliminando release:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error eliminando release",
    });
  }
});

export default router;
