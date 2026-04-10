import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

type ParamSlug = { slug: string };

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/public/site ──────────────────────────────────────────────────────
// Endpoint principal del sitio público. Devuelve TODO lo necesario para renderizar
// la página en una sola request. Así el frontend hace solo 1 fetch al cargar.
//
// Patrón: "Big payload, one trip" — mejor que N fetches separados para un sitio
// estático/semi-estático como este. Si el catálogo crece mucho, considera caché.
router.get("/site", async (_req: Request, res: Response) => {
  try {
    // Ejecutar todas las queries en paralelo con Promise.all — mucho más rápido que
    // hacerlas secuenciales. SQLite es local así que el overhead es mínimo.
    const [artists, releases, upcoming, videos, popup] = await Promise.all([
      // Artistas activos con sus releases y videos incluidos
      prisma.artist.findMany({
        where: { active: true },
        include: {
          releases: {
            where: { active: true },
            orderBy: [{ order: "asc" }, { date: "desc" }],
          },
          videos: {
            where: { active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),

      // Releases activos con artista (para la sección de catálogo general)
      prisma.release.findMany({
        where: { active: true },
        include: {
          artist: {
            select: { id: true, name: true, slug: true, image: true, flag: true },
          },
        },
        orderBy: [{ order: "asc" }, { date: "desc" }],
      }),

      // Próximos lanzamientos activos
      prisma.upcoming.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { date: "asc" }],
      }),

      // Videos activos con artista
      prisma.video.findMany({
        where: { active: true },
        include: {
          artist: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),

      // Popup config (upsert garantiza que exista el singleton)
      prisma.popupConfig.upsert({
        where: { id: "singleton" },
        create: { id: "singleton" },
        update: {},
      }),
    ]);

    res.json({
      artists,
      releases,
      upcoming,
      videos,
      popup,
      // Timestamp para que el frontend sepa cuándo fue el último fetch
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[PUBLIC] Error obteniendo data del sitio:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo datos del sitio",
    });
  }
});

// ─── GET /api/public/artist/:slug ──────────────────────────────────────────────
// Artista público por slug — para páginas individuales de artista.
router.get("/artist/:slug", async (req: Request<ParamSlug>, res: Response) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { slug: req.params.slug },
      include: {
        releases: {
          where: { active: true },
          orderBy: [{ order: "asc" }, { date: "desc" }],
        },
        videos: {
          where: { active: true },
          orderBy: [{ order: "asc" }],
        },
        linkPage: {
          include: {
            links: {
              where: { active: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!artist || !artist.active) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Artista no encontrado",
      });
      return;
    }

    res.json({ artist });
  } catch (err) {
    console.error("[PUBLIC] Error obteniendo artista:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo artista",
    });
  }
});

export default router;
