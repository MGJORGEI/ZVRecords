# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

ZV Records is a full-stack record label platform with three main surfaces:
- **Public website** — vanilla HTML/CSS/JS with GSAP scroll animations (`index.html`)
- **Admin panel** — SPA for content management (`admin/index.html`)
- **Express API** — REST backend with JWT + API token auth (`server/`)
- **Next.js frontend** — React-based pages under `src/` (secondary layer)

## Commands

### Next.js Frontend (root)
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
```

### Express Server (`server/`)
```bash
cd server
npm run dev          # Start with tsx watch (hot reload), port 3500
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JS from dist/
```

### Database (from `server/`)
```bash
npx prisma db push   # Sync schema to SQLite
npx prisma studio    # GUI database browser
npm run db:seed      # Seed with initial data (tsx prisma/seed.ts)
```

## Architecture

### Two-Package Structure
- **Root** (`package.json`): Next.js 16, React 19, Tailwind CSS 4, GSAP, Framer Motion
- **Server** (`server/package.json`): Express 5, Prisma 6, SQLite (better-sqlite3), JWT auth

### Database
SQLite via Prisma ORM. Schema at `server/prisma/schema.prisma`. DB file at `server/prisma/data/zv.db`.

**Models:** User, Artist, Release, Video, Upcoming, PopupConfig, LinkPage, LinkItem, ApiToken

Artist bios use per-column i18n: `bio`, `bioEn`, `bioEs`, `bioJa`, `bioKo`.

### API Design
- **Public endpoints** (no auth): `/api/public/site` (single-trip fetch of all site data via `Promise.all`), `/api/public/artist/:slug`, `/api/links/:slug`
- **Protected endpoints** (JWT or API token): CRUD for artists, releases, videos, upcoming, links, popup, tokens
- **SSR link pages**: `/l/:slug` renders full HTML server-side with platform auto-detection and inline embeds (7 themes)

### Authentication
- **JWT**: `Authorization: Bearer <token>`, 7-day expiry, for admin panel
- **API Tokens**: `X-API-Token: zvt_<uuid>`, for external integrations
- Passwords hashed with bcryptjs (12 rounds)
- Rate limiting: 5 auth attempts per 15 minutes

### File Uploads
Single endpoint `POST /api/upload` via Multer. Max 5MB, JPEG/PNG/WebP/GIF only. Stored in `public/assets/uploads/`.

### Server Entry Point
`server/src/index.ts` — sets up Helmet, CORS (localhost:3000/3001/3500), rate limiting, Multer, all routes, static file serving, and error handling.

### Frontend Path Alias
`@/*` maps to `./src/*` in tsconfig.

### Design Tokens
- Background: `#0D0D0D`, Surface: `#1A1A1A`, Border: `#2A2A2A`
- Accent cyan: `#00E5FF`, Accent magenta: `#FF00B4`
- Fonts: Bebas Neue (display), Syne (body), JetBrains Mono (mono)

## Environment Variables

Server reads from `.env` (no `.env.example` exists):
```
PORT=3500
DATABASE_URL="file:./data/zv.db"
JWT_SECRET=<your-secret>
```

## Key Conventions

- Express 5 with native ESM (`"type": "module"` in server)
- API tokens use soft delete (`active=false`) for audit trail
- Public site is pre-built vanilla HTML, not generated from Next.js
- No test framework configured
- Server routes are in `server/src/routes/`, middleware in `server/src/middleware/`
