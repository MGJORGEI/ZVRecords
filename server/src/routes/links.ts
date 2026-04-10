import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { apiTokenMiddleware as authMiddleware } from "../middleware/auth.js";

type ParamSlug = { slug: string };

const router = Router();
const prisma = new PrismaClient();

// ─── Tipo para los links del body ──────────────────────────────────────────────
interface LinkItemInput {
  title: string;
  url: string;
  icon?: string;
  color?: string;
  textColor?: string;
  style?: string;
  order?: number;
  active?: boolean;
}

// ─── GET /api/links ────────────────────────────────────────────────────────────
// Lista todas las link pages. Solo admins.
router.get("/", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const pages = await prisma.linkPage.findMany({
      include: {
        links: {
          orderBy: { order: "asc" },
        },
        artist: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { links: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ pages, total: pages.length });
  } catch (err) {
    console.error("[LINKS] Error listando link pages:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo link pages",
    });
  }
});

// ─── POST /api/links ───────────────────────────────────────────────────────────
// Crea link page con sus links en una sola transacción.
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      slug,
      title,
      bio = "",
      avatar = "",
      theme = "dark",
      bgColor = "#0D0D0D",
      accentColor = "#00E5FF",
      textColor = "#F0F0F0",
      artistId,
      links = [],
    } = req.body as {
      slug?: string;
      title?: string;
      bio?: string;
      avatar?: string;
      theme?: string;
      bgColor?: string;
      accentColor?: string;
      textColor?: string;
      artistId?: string;
      links?: LinkItemInput[];
    };

    if (!slug || !title) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "slug y title son requeridos",
      });
      return;
    }

    // Verificar que el slug no esté tomado
    const existing = await prisma.linkPage.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({
        error: "CONFLICT",
        message: `El slug "${slug}" ya está en uso`,
      });
      return;
    }

    // Verificar artista si se manda
    if (artistId) {
      const artist = await prisma.artist.findUnique({ where: { id: artistId } });
      if (!artist) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Artista no encontrado",
        });
        return;
      }
    }

    // Transacción: crear página y sus links juntos
    const page = await prisma.linkPage.create({
      data: {
        slug: slug.trim().toLowerCase(),
        title: title.trim(),
        bio,
        avatar,
        theme,
        bgColor,
        accentColor,
        textColor,
        artistId: artistId || null,
        links: {
          create: links.map((link, idx) => ({
            title: link.title,
            url: link.url,
            icon: link.icon ?? "",
            color: link.color ?? "",
            textColor: link.textColor ?? "",
            style: link.style ?? "",
            order: link.order ?? idx,
            active: link.active ?? true,
          })),
        },
      },
      include: {
        links: { orderBy: { order: "asc" } },
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({
      message: "Link page creada correctamente",
      page,
    });
  } catch (err) {
    console.error("[LINKS] Error creando link page:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error creando link page",
    });
  }
});

// ─── GET /api/links/:slug ──────────────────────────────────────────────────────
// PÚBLICO — este es el endpoint que renderiza /l/:slug en el frontend.
router.get("/:slug", async (req: Request<ParamSlug>, res: Response) => {
  try {
    const page = await prisma.linkPage.findUnique({
      where: { slug: req.params.slug },
      include: {
        links: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
        artist: {
          select: { id: true, name: true, slug: true, image: true },
        },
      },
    });

    if (!page || !page.active) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Link page no encontrada",
      });
      return;
    }

    res.json({ page });
  } catch (err) {
    console.error("[LINKS] Error obteniendo link page:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error obteniendo link page",
    });
  }
});

// ─── PUT /api/links/:slug ──────────────────────────────────────────────────────
// Actualiza la link page Y reemplaza todos sus links.
// Estrategia: delete-and-recreate para simplificar el manejo de orden.
router.put("/:slug", authMiddleware, async (req: Request<ParamSlug>, res: Response) => {
  try {
    const existing = await prisma.linkPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Link page no encontrada",
      });
      return;
    }

    const {
      title,
      bio,
      avatar,
      theme,
      bgColor,
      accentColor,
      textColor,
      active,
      artistId,
      links,
    } = req.body as {
      title?: string;
      bio?: string;
      avatar?: string;
      theme?: string;
      bgColor?: string;
      accentColor?: string;
      textColor?: string;
      active?: boolean;
      artistId?: string | null;
      links?: LinkItemInput[];
    };

    // Campos escalares de la página
    const pageData: Record<string, unknown> = {};
    const scalarFields = [
      "title", "bio", "avatar", "theme", "bgColor",
      "accentColor", "textColor", "active", "artistId",
    ];
    for (const field of scalarFields) {
      if (req.body[field] !== undefined) {
        pageData[field] = req.body[field];
      }
    }

    // Si vienen links, los reemplazamos todos en una transacción
    let page;
    if (links !== undefined) {
      page = await prisma.$transaction(async (tx) => {
        // Borra los links anteriores
        await tx.linkItem.deleteMany({
          where: { linkPageId: existing.id },
        });

        // Actualiza la página y crea los nuevos links
        return tx.linkPage.update({
          where: { id: existing.id },
          data: {
            ...pageData,
            links: {
              create: links.map((link, idx) => ({
                title: link.title,
                url: link.url,
                icon: link.icon ?? "",
                color: link.color ?? "",
                textColor: link.textColor ?? "",
                style: link.style ?? "",
                order: link.order ?? idx,
                active: link.active ?? true,
              })),
            },
          },
          include: {
            links: { orderBy: { order: "asc" } },
            artist: { select: { id: true, name: true, slug: true } },
          },
        });
      });
    } else {
      // Sin links → solo actualizamos los campos de la página
      page = await prisma.linkPage.update({
        where: { id: existing.id },
        data: pageData,
        include: {
          links: { orderBy: { order: "asc" } },
          artist: { select: { id: true, name: true, slug: true } },
        },
      });
    }

    res.json({
      message: "Link page actualizada correctamente",
      page,
    });
  } catch (err) {
    console.error("[LINKS] Error actualizando link page:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error actualizando link page",
    });
  }
});

// ─── DELETE /api/links/:slug ───────────────────────────────────────────────────
// Borra la link page y todos sus links (cascade en schema).
router.delete("/:slug", authMiddleware, async (req: Request<ParamSlug>, res: Response) => {
  try {
    const existing = await prisma.linkPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Link page no encontrada",
      });
      return;
    }

    await prisma.linkPage.delete({ where: { id: existing.id } });

    res.json({ message: "Link page eliminada correctamente" });
  } catch (err) {
    console.error("[LINKS] Error eliminando link page:", err);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error eliminando link page",
    });
  }
});

export default router;
