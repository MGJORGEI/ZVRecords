<div align="center">

```
 ________   __   __   _______    _______    ______    ______    _______    ______   ______  
|       /  |  | |  | |   __  \  |   ____|  /      |  /  __  \  |   __  \  |      \ /      | 
`---/  /   |  | |  | |  |__) |  |  |__    |  ,----' |  |  |  | |  |__) |  |  .--.  |  ,----' 
   /  /    |  | |  | |      /   |   __|   |  |      |  |  |  | |      /   |  |  |  |  `--.   
  /  /----.|  `-'  | |  |\  \   |  |____  |  `----. |  `--'  | |  |\  \   |  '--'  |  .--'   
 /________| \____/  | _| `._\  |_______|  \______|  \______/  | _| `._\  |______/ \______|  
```

### **PRODUCTION CO. RECORDS**

*Where sound meets vision*

---

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com/)
[![License](https://img.shields.io/badge/License-Private-FF00B4?style=flat-square)](/)

</div>

---

## Overview

**ZV Records** is a professional record label web platform built from scratch. Designed to rival the digital presence of major labels like Warner, Universal, and Sony, it features a cinematic public-facing website, a full-featured admin panel, a REST API, and a customizable link-in-bio generator.

> Built with **Express 5 + Prisma 6 + vanilla HTML/CSS/JS + GSAP** for maximum performance and zero framework bloat on the frontend.

---

## Architecture

```
ZVRecords/
|
|-- index.html              # Public website (scroll-driven, cinematic)
|-- admin/index.html         # Admin panel (SPA, full CRUD)
|-- server/
|   |-- src/
|   |   |-- index.ts          # Express 5 server + Multer uploads
|   |   |-- routes/
|   |   |   |-- artists.ts     # Artists CRUD
|   |   |   |-- releases.ts    # Releases CRUD
|   |   |   |-- videos.ts      # Videos CRUD
|   |   |   |-- upcoming.ts    # Upcoming releases
|   |   |   |-- links.ts       # Link pages CRUD
|   |   |   |-- link-page-renderer.ts  # SSR link page renderer
|   |   |   |-- popup.ts       # Popup config
|   |   |   |-- tokens.ts      # API token management
|   |   |   |-- auth.ts        # JWT authentication
|   |   |   |-- public.ts      # Public endpoints
|   |   |-- middleware/
|   |       |-- auth.ts        # Auth + API token middleware
|   |-- prisma/
|       |-- schema.prisma      # Database schema (8 models)
|       |-- seed.ts            # Seed with sample artists
|-- public/
|   |-- assets/
|       |-- sequence/          # 192 hero scroll frames
|       |-- frames/            # Video thumbnails & section images
|-- src/                       # Next.js app (secondary, not primary)
```

---

## Features

### Public Website
- **Scroll-driven hero** with 192-frame canvas sequence animation (GSAP + ScrollTrigger)
- **Film grain overlay** generated via canvas for cinematic texture
- **Infinite carousel** for Global Talent / Channels section with 3D glassmorphism cards
- **Marquee tickers** between sections (infinite scroll text bands)
- **Floating glow orbs** with CSS animations for ambient depth
- **Featured release hero** with full-bleed background, equalizer animation, and platform buttons
- **Release grid** with hover effects and type badges
- **Video section** with YouTube embeds and cinematic thumbnails
- **Responsive** from 320px to 4K displays
- **i18n** in 4 languages: English, Spanish, Japanese, Korean

### Admin Panel
- **Artists** — Full CRUD with image upload, social links, market/genre tagging
- **Channels** — Inline platform editing (Spotify, Apple Music, YouTube, TikTok, Instagram) with drag-and-drop image upload per artist
- **Releases** — Manage singles, EPs, albums with cover art and streaming links
- **Videos** — YouTube video management with type classification (MV, clip, live)
- **Upcoming** — Future release countdown management
- **Link Pages** — Linktree-style page builder with 7 themes, live phone preview, per-link color customization
- **Popup** — Site-wide new release popup with animated vinyl disc
- **Users & API Tokens** — Authentication and API access management

### Link Generator (`/l/:slug`)
- **Server-side rendered** landing pages per artist
- **Platform auto-detection** from URL (Spotify, Apple Music, YouTube, TikTok, SoundCloud, Deezer, etc.)
- **Inline embeds** for Spotify (Follow + Play), YouTube, Apple Music, SoundCloud
- **7 themes**: Dark, Neon, Glass, Gradient Dark, Minimal, Brutalist, Retro
- **Custom colors** per link and per page

### API
- **RESTful** endpoints for all resources
- **JWT + API Token** dual authentication
- **Multer** image uploads (JPEG, PNG, WebP, GIF, 5MB max)
- **Prisma 6** ORM with SQLite for zero-config database

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/MGJORGEI/ZVRecords.git
cd ZVRecords

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Setup database
cd server
npx prisma db push
npx tsx prisma/seed.ts   # Optional: seed sample artists
cd ..

# 4. Start the server
cd server
npx tsx src/index.ts
```

Then open:
| URL | Description |
|-----|-------------|
| `http://localhost:3500` | Public website |
| `http://localhost:3500/admin` | Admin panel |
| `http://localhost:3500/api/health` | API health check |
| `http://localhost:3500/l/:slug` | Link pages |

> **Default admin credentials:** `admin` / `ZvRecords2024!`

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Server** | Express 5.2 | Lightweight, fast, industry standard |
| **Database** | SQLite + Prisma 6 | Zero-config, portable, type-safe |
| **Frontend** | Vanilla HTML/CSS/JS | Zero bundle, instant load, full control |
| **Animations** | GSAP 3.12 + ScrollTrigger | Industry-standard animation library |
| **Auth** | JWT + bcrypt | Stateless, secure |
| **Uploads** | Multer | Battle-tested file handling |
| **Runtime** | Node.js 22 | Latest LTS with native ESM |

---

## Design System

```css
/* Colors */
--zv-black:   #0D0D0D    /* Background */
--zv-card:    #1A1A1A    /* Card surfaces */
--zv-border:  #2A2A2A    /* Borders */
--zv-cyan:    #00E5FF    /* Primary accent */
--zv-magenta: #FF00B4    /* Secondary accent */
--zv-white:   #F0F0F0    /* Text */
--zv-muted:   #888888    /* Muted text */

/* Typography */
Bebas Neue     — Display headings
Syne           — Body text
JetBrains Mono — Monospace / labels
```

---

## Database Schema

```
User          — Admin authentication
Artist        — Label roster (name, slug, genre, market, socials, image)
Release       — Discography (title, type, cover, streaming links)
Video         — YouTube content (title, youtubeId, type)
Upcoming      — Future releases with countdown
LinkPage      — Customizable landing pages per artist
LinkItem      — Individual links on a LinkPage
PopupConfig   — Site-wide promotional popup
ApiToken      — API access tokens
```

---

## API Endpoints

<details>
<summary><strong>Public</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health |
| `GET` | `/api/public/site` | All site data |
| `GET` | `/api/public/artist/:slug` | Single artist + link page |
| `GET` | `/api/links/:slug` | Public link page |
| `GET` | `/l/:slug` | SSR link page (HTML) |

</details>

<details>
<summary><strong>Admin (requires auth)</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login |
| `GET/POST/PUT/DELETE` | `/api/artists` | Artists CRUD |
| `GET/POST/PUT/DELETE` | `/api/releases` | Releases CRUD |
| `GET/POST/PUT/DELETE` | `/api/videos` | Videos CRUD |
| `GET/POST/PUT/DELETE` | `/api/upcoming` | Upcoming CRUD |
| `GET/POST/PUT/DELETE` | `/api/links` | Link pages CRUD |
| `PUT` | `/api/popup` | Update popup config |
| `POST` | `/api/upload` | Upload image |
| `GET/POST/DELETE` | `/api/tokens` | API tokens |

</details>

---

## Screenshots

> *Coming soon*

---

<div align="center">

**ZV Records** &copy; 2025 — All rights reserved.

Built with persistence, coffee, and Claude.

```
  ██████╗ ██╗   ██╗
  ╚════██╗██║   ██║
   █████╔╝██║   ██║
  ██╔═══╝ ╚██╗ ██╔╝
  ███████╗ ╚████╔╝
  ╚══════╝  ╚═══╝  RECORDS
```

</div>
