import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

// Express 5 tipa req.params como Record<string, string | string[]>,
// por eso tipamos cada handler que use params con este generic.
type ParamId = { id: string };

const router = Router();
const prisma = new PrismaClient();

// ─── Helper: genera slug limpio desde nombre ───────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos (á→a, é→e, etc.)
    .replace(/[^a-z0-9\s-]/g, "") // Solo alfanuméricos y guiones
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-"); // Múltiples guiones a uno
}

// Todos los endpoints de artists requieren auth
router.use(authMiddleware);

// ─── GET /api/artists ──────────────────────────────────────────────────────────
// Lista todos los artistas. Acepta ?active=true para filtrar solo activos.
router.get("/", async (req: Request, res: Response) => {
  try {
    const activeFilter = req.query.active;

    const artists = await prisma.artist.findMany({
      where:
        activeFilter === "true"
          ? { active: true }
          : activeFilter === "false"
            ? { active: false }
            : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { releases: true, videos: true },
        },
      },
    });

    res.json({ artists, total: artists.length });
  } catch (err) {
    console.error("[ARTISTS] Error listando artistas:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo artistas",
    });
  }
});

// ─── GET /api/artists/:id ──────────────────────────────────────────────────────
// Artista individual con sus releases, videos y link page incluidos
router.get("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        releases: {
          orderBy: [{ order: "asc" }, { date: "desc" }],
        },
        videos: {
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

    if (!artist) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Artista no encontrado",
      });
      return;
    }

    res.json({ artist });
  } catch (err) {
    console.error("[ARTISTS] Error obteniendo artista:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo artista",
    });
  }
});

// ─── POST /api/artists ─────────────────────────────────────────────────────────
// Crea artista nuevo. El slug se genera automáticamente del nombre.
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      name,
      genre,
      bio = "",
      bioEn = "",
      bioEs = "",
      bioJa = "",
      bioKo = "",
      image = "",
      flag = "🇲🇽",
      market = "LATIN",
      spotify = "",
      youtube = "",
      tiktok = "",
      instagram = "",
      appleMusic = "",
      featured = false,
      order = 0,
    } = req.body as {
      name?: string;
      genre?: string;
      bio?: string;
      bioEn?: string;
      bioEs?: string;
      bioJa?: string;
      bioKo?: string;
      image?: string;
      flag?: string;
      market?: string;
      spotify?: string;
      youtube?: string;
      tiktok?: string;
      instagram?: string;
      appleMusic?: string;
      featured?: boolean;
      order?: number;
    };

    if (!name || !genre) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "name y genre son requeridos",
      });
      return;
    }

    // Genera slug base y maneja colisiones agregando sufijo numérico
    let slug = generateSlug(name);
    let slugAttempt = slug;
    let counter = 1;

    while (await prisma.artist.findUnique({ where: { slug: slugAttempt } })) {
      slugAttempt = `${slug}-${counter}`;
      counter++;
    }

    const artist = await prisma.artist.create({
      data: {
        name: name.trim(),
        slug: slugAttempt,
        genre: genre.trim(),
        bio,
        bioEn,
        bioEs,
        bioJa,
        bioKo,
        image,
        flag,
        market,
        spotify,
        youtube,
        tiktok,
        instagram,
        appleMusic,
        featured,
        order,
      },
    });

    res.status(201).json({
      message: "Artista creado correctamente",
      artist,
    });
  } catch (err) {
    console.error("[ARTISTS] Error creando artista:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error creando artista",
    });
  }
});

// ─── PUT /api/artists/:id ──────────────────────────────────────────────────────
// Actualiza artista. Permite actualizar solo los campos que se manden.
router.put("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.artist.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Artista no encontrado",
      });
      return;
    }

    // Si viene un nombre nuevo, regenerar el slug
    let slugUpdate: string | undefined;
    if (req.body.name && req.body.name !== existing.name) {
      let slug = generateSlug(req.body.name as string);
      let slugAttempt = slug;
      let counter = 1;

      while (
        await prisma.artist.findFirst({
          where: { slug: slugAttempt, NOT: { id: req.params.id } },
        })
      ) {
        slugAttempt = `${slug}-${counter}`;
        counter++;
      }
      slugUpdate = slugAttempt;
    }

    // Filtramos solo los campos que vienen en el body (patch parcial)
    const allowedFields = [
      "name",
      "genre",
      "bio",
      "bioEn",
      "bioEs",
      "bioJa",
      "bioKo",
      "image",
      "flag",
      "market",
      "spotify",
      "youtube",
      "tiktok",
      "instagram",
      "appleMusic",
      "featured",
      "order",
      "active",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (slugUpdate) {
      updateData.slug = slugUpdate;
    }

    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      message: "Artista actualizado correctamente",
      artist,
    });
  } catch (err) {
    console.error("[ARTISTS] Error actualizando artista:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando artista",
    });
  }
});

// ─── DELETE /api/artists/:id ───────────────────────────────────────────────────
// Soft delete: pone active=false en lugar de borrar el registro.
// Así no se pierden los datos y se pueden recuperar.
router.delete("/:id", async (req: Request<ParamId>, res: Response) => {
  try {
    const existing = await prisma.artist.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Artista no encontrado",
      });
      return;
    }

    await prisma.artist.update({
      where: { id: req.params.id },
      data: { active: false },
    });

    res.json({
      message: "Artista desactivado correctamente",
    });
  } catch (err) {
    console.error("[ARTISTS] Error desactivando artista:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error desactivando artista",
    });
  }
});

export default router;
