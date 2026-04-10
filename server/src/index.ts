import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import multer from "multer";

// ─── Carga .env manual — compatible con Node 18 y Node 20+ ────────────────────
// En producción las vars deben estar en el ambiente, esto es solo para dev.
try {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // Sin .env está bien si las vars ya están en el ambiente
}

// Rutas
import authRouter from "./routes/auth.js";
import artistsRouter from "./routes/artists.js";
import releasesRouter from "./routes/releases.js";
import upcomingRouter from "./routes/upcoming.js";
import videosRouter from "./routes/videos.js";
import popupRouter from "./routes/popup.js";
import linksRouter from "./routes/links.js";
import tokensRouter from "./routes/tokens.js";
import publicRouter from "./routes/public.js";

// ─── ESM dirname shim ──────────────────────────────────────────────────────────
// Con "type": "module" no existe __dirname. Esto lo recrea.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// El server está en /server/src/, el root del proyecto está 2 niveles arriba
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// ─── App ───────────────────────────────────────────────────────────────────────
const app = express();
const PORT = Number(process.env.PORT) || 3500;

// ─── Seguridad ─────────────────────────────────────────────────────────────────
// helmet pone headers de seguridad automáticos (X-Frame-Options, CSP, etc.)
// Desactivamos contentSecurityPolicy para que el admin panel cargue sin problemas
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3500",
      // Agrega tu dominio de producción aquí cuando lo tengas
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Token"],
  })
);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// Limitamos auth a 5 intentos por 15 minutos para evitar brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Demasiados intentos. Espera 15 minutos e intenta de nuevo.",
  },
  // Solo aplica el límite en el endpoint de login, no en /me o /register
  skip: (req) => req.path !== "/login",
});

// ─── Archivos estáticos ────────────────────────────────────────────────────────
// Sirve los assets públicos (imágenes, uploads)
app.use(
  "/assets",
  express.static(path.join(PROJECT_ROOT, "public", "assets"), {
    maxAge: "7d", // Cache de 7 días en el browser para assets estáticos
  })
);

// ─── Multer — subida de imágenes ───────────────────────────────────────────────
const uploadsDir = path.join(PROJECT_ROOT, "public", "assets", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Nombre único: timestamp + nombre original sanitizado
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${timestamp}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG, PNG, WebP, GIF)"));
    }
  },
});

// ─── Upload endpoint ───────────────────────────────────────────────────────────
// POST /api/upload — sube una imagen y devuelve la URL pública
app.post(
  "/api/upload",
  (req: Request, res: Response, next: NextFunction) => {
    // Auth inline aquí para no importar el middleware de forma circular
    const authHeader = req.headers.authorization;
    const apiToken = req.headers["x-api-token"];

    if (!authHeader && !apiToken) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Autenticación requerida para subir archivos",
      });
      return;
    }
    next();
  },
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "No se recibió ningún archivo",
      });
      return;
    }

    // URL pública del archivo subido
    const url = `/assets/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Imagen subida correctamente",
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  }
);

// ─── API index — protegido, solo con token muestra el diccionario ────────────
app.get("/api", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const apiToken = req.headers["x-api-token"];

  if (!authHeader && !apiToken) {
    res.status(401).json({
      name: "ZV Records API",
      version: "1.0.0",
      message: "Authentication required. Provide a Bearer token or X-API-Token header.",
    });
    return;
  }

  res.json({
    name: "ZV Records API",
    version: "1.0.0",
    endpoints: {
      public: { method: "GET", path: "/api/public/site", auth: false, description: "All site data" },
      health: { method: "GET", path: "/api/health", auth: false, description: "Server health" },
      auth_login: { method: "POST", path: "/api/auth/login", auth: false, description: "Login" },
      auth_register: { method: "POST", path: "/api/auth/register", auth: true, description: "Create admin user" },
      auth_me: { method: "GET", path: "/api/auth/me", auth: true, description: "Current user" },
      artists: { methods: "GET|POST|PUT|DELETE", path: "/api/artists", auth: true },
      releases: { methods: "GET|POST|PUT|DELETE", path: "/api/releases", auth: true },
      upcoming: { methods: "GET|POST|PUT|DELETE", path: "/api/upcoming", auth: true },
      videos: { methods: "GET|POST|PUT|DELETE", path: "/api/videos", auth: true },
      popup: { methods: "GET|PUT", path: "/api/popup", auth: true },
      links: { methods: "GET|POST|PUT|DELETE", path: "/api/links", auth: "GET /:slug is public" },
      tokens: { methods: "GET|POST|DELETE", path: "/api/tokens", auth: true },
      upload: { method: "POST", path: "/api/upload", auth: true, description: "Upload image" },
    },
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/releases", releasesRouter);
app.use("/api/upcoming", upcomingRouter);
app.use("/api/videos", videosRouter);
app.use("/api/popup", popupRouter);
app.use("/api/links", linksRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/public", publicRouter);

// ─── Link pages: /l/:slug — Render dinámico SSR ─────────────────────────────
import { renderLinkPage } from "./routes/link-page-renderer.js";
app.get("/l/:slug", async (req: Request, res: Response) => {
  try {
    const html = await renderLinkPage(String(req.params.slug));
    if (!html) { res.status(404).send("Not found"); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch {
    res.status(500).send("Error");
  }
});

// ─── Admin panel: /admin ───────────────────────────────────────────────────────
// Si existe el directorio admin, sirve el index.html
app.use(
  "/admin",
  express.static(path.join(PROJECT_ROOT, "admin"), {
    index: "index.html",
  })
);

// Fallback para SPA del admin (rutas del router del admin panel)
app.get("/admin/*path", (_req: Request, res: Response) => {
  const adminIndex = path.join(PROJECT_ROOT, "admin", "index.html");
  res.sendFile(adminIndex, (err) => {
    if (err) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Admin panel no encontrado",
      });
    }
  });
});

// ─── Sitio público: / ──────────────────────────────────────────────────────────
// Sirve el sitio público desde el root del proyecto
app.use(
  express.static(path.join(PROJECT_ROOT), {
    index: "index.html",
    // No servir directorios sensibles
    dotfiles: "deny",
  })
);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── 404 para rutas API no encontradas ────────────────────────────────────────
app.use("/api/*path", (_req: Request, res: Response) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint no encontrado",
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
// Express 5 necesita el error handler con 4 params para reconocerlo como tal.
// IMPORTANTE: debe ser el ÚLTIMO middleware registrado.
const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[ERROR]", err.message, err.stack);

  // Error de multer (tipo de archivo no permitido, tamaño excedido)
  if (err.name === "MulterError") {
    res.status(400).json({
      error: "UPLOAD_ERROR",
      message:
        err.message === "File too large"
          ? "El archivo es demasiado grande (máximo 5MB)"
          : err.message,
    });
    return;
  }

  // Error de JWT malformado
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Token inválido o expirado",
    });
    return;
  }

  // Cualquier otro error — no exponemos el stack trace en producción
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "SERVER_ERROR",
    message: "Error interno del servidor",
    ...(isDev && { detail: err.message, stack: err.stack }),
  });
};

app.use(errorHandler);

// ─── Arrancar el server ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║       ZV Records API Server            ║
║  Corriendo en http://localhost:${PORT}   ║
╚════════════════════════════════════════╝

  API:    http://localhost:${PORT}/api/public/site
  Admin:  http://localhost:${PORT}/admin
  Health: http://localhost:${PORT}/api/health
  `);
});

export default app;
