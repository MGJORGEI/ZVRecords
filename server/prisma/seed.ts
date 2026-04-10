import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Carga manual del .env — necesario en Node 18 donde --env-file no existe todavía
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envPath = resolve(__dirname, "../.env");
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
  // Si no hay .env está bien, pueden estar seteadas las vars de ambiente ya
}

const prisma = new PrismaClient();

// ─── Helper: genera slug limpio ────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  console.log("🌱 Iniciando seed de ZV Records...\n");

  // ─── 1. Limpiar DB (orden importa por foreign keys) ─────────────────────────
  await prisma.linkItem.deleteMany();
  await prisma.linkPage.deleteMany();
  await prisma.video.deleteMany();
  await prisma.release.deleteMany();
  await prisma.upcoming.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.popupConfig.deleteMany();
  await prisma.apiToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ DB limpiada\n");

  // ─── 2. Admin user ──────────────────────────────────────────────────────────
  const adminPassword = "ZvRecords2024!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✓ Usuario admin creado");
  console.log("  ┌────────────────────────────────────┐");
  console.log("  │  Username: admin                   │");
  console.log(`  │  Password: ${adminPassword}         │`);
  console.log("  │  CAMBIA ESTO EN PRODUCCIÓN !!!     │");
  console.log("  └────────────────────────────────────┘\n");

  // ─── 3. PopupConfig singleton ────────────────────────────────────────────────
  await prisma.popupConfig.create({
    data: {
      id: "singleton",
      enabled: true,
      title: "MEDIANOCHE",
      artistName: "LUNA ROJA × VELOZ",
      cover: "",
      label: "OUT NOW",
      listenUrl: "https://open.spotify.com",
      badgeText: "🔥 NEW RELEASE",
    },
  });

  console.log("✓ PopupConfig creado\n");

  // ─── 4. Artistas ─────────────────────────────────────────────────────────────

  // Artista 1: VELOZ
  const veloz = await prisma.artist.create({
    data: {
      name: "VELOZ",
      slug: generateSlug("VELOZ"),
      genre: "Urban / Trap Latino",
      bio: "Artista urbano de Ciudad de México, fusionando trap latino con sonidos electrónicos. Su estilo crudo y auténtico lo ha convertido en una de las voces más distintivas de la escena underground.",
      bioEn: "Urban artist from Mexico City, fusing Latin trap with electronic sounds. His raw and authentic style has made him one of the most distinctive voices in the underground scene.",
      bioEs: "Artista urbano de Ciudad de México, fusionando trap latino con sonidos electrónicos.",
      bioJa: "メキシコシティ出身のアーバンアーティスト。ラテントラップと電子音楽を融合させています。",
      bioKo: "멕시코시티 출신의 어반 아티스트로, 라틴 트랩과 일렉트로닉 사운드를 융합합니다.",
      image: "",
      flag: "🇲🇽",
      market: "LATIN",
      spotify: "https://open.spotify.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
      instagram: "https://instagram.com",
      appleMusic: "https://music.apple.com",
      featured: true,
      order: 1,
      active: true,
    },
  });

  // Artista 2: LUNA ROJA
  const lunaRoja = await prisma.artist.create({
    data: {
      name: "LUNA ROJA",
      slug: generateSlug("LUNA ROJA"),
      genre: "R&B / Soul Latino",
      bio: "Voz de otro mundo. Luna Roja mezcla R&B oscuro con poesía urbana, creando atmósferas únicas que resuenan en el corazón de una generación que busca algo más que música.",
      bioEn: "An otherworldly voice. Luna Roja blends dark R&B with urban poetry, creating unique atmospheres that resonate in the heart of a generation seeking more than music.",
      bioEs: "Voz de otro mundo. Luna Roja mezcla R&B oscuro con poesía urbana.",
      bioJa: "別世界の声。Luna Rojaはダークなリズム&ブルースとアーバンポエトリーを融合させています。",
      bioKo: "다른 세계의 목소리. Luna Roja는 어두운 R&B와 어반 시를 혼합합니다.",
      image: "",
      flag: "🇲🇽",
      market: "LATIN",
      spotify: "https://open.spotify.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
      instagram: "https://instagram.com",
      appleMusic: "https://music.apple.com",
      featured: true,
      order: 2,
      active: true,
    },
  });

  // Artista 3: NOVA
  const nova = await prisma.artist.create({
    data: {
      name: "NOVA",
      slug: generateSlug("NOVA"),
      genre: "Electronic / Future Bass",
      bio: "Productor y DJ de Guadalajara que lleva los sonidos del futuro al presente. Sus sets han cruzado fronteras desde Japón hasta Europa, representando el talento mexicano en los festivales más importantes del mundo.",
      bioEn: "Producer and DJ from Guadalajara bringing future sounds to the present. His sets have crossed borders from Japan to Europe, representing Mexican talent at the world's most important festivals.",
      bioEs: "Productor y DJ de Guadalajara que lleva los sonidos del futuro al presente.",
      bioJa: "グアダラハラ出身のプロデューサー兼DJで、未来のサウンドを現在に届けています。",
      bioKo: "과달라하라 출신의 프로듀서 겸 DJ로, 미래의 사운드를 현재에 전달합니다.",
      image: "",
      flag: "🇲🇽",
      market: "GLOBAL",
      spotify: "https://open.spotify.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
      instagram: "https://instagram.com",
      appleMusic: "https://music.apple.com",
      featured: false,
      order: 3,
      active: true,
    },
  });

  console.log("✓ Artistas creados: VELOZ, LUNA ROJA, NOVA\n");

  // ─── 5. Releases ─────────────────────────────────────────────────────────────

  await prisma.release.createMany({
    data: [
      // VELOZ releases
      {
        title: "FANTASMA",
        type: "single",
        cover: "",
        date: "2025-11-15",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: true,
        order: 1,
        artistId: veloz.id,
      },
      {
        title: "CÓDIGO NEGRO",
        type: "ep",
        cover: "",
        date: "2025-08-20",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: false,
        order: 2,
        artistId: veloz.id,
      },
      {
        title: "SIN FRENOS",
        type: "single",
        cover: "",
        date: "2025-05-10",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: false,
        order: 3,
        artistId: veloz.id,
      },
      // LUNA ROJA releases
      {
        title: "MEDIANOCHE",
        type: "single",
        cover: "",
        date: "2025-12-01",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: true,
        order: 1,
        artistId: lunaRoja.id,
      },
      {
        title: "ECLIPSE",
        type: "album",
        cover: "",
        date: "2025-07-04",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: false,
        order: 2,
        artistId: lunaRoja.id,
      },
      // NOVA releases
      {
        title: "SIGNAL",
        type: "single",
        cover: "",
        date: "2025-10-30",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: false,
        order: 1,
        artistId: nova.id,
      },
      {
        title: "HYPERSPACE EP",
        type: "ep",
        cover: "",
        date: "2025-06-15",
        spotify: "https://open.spotify.com",
        appleMusic: "https://music.apple.com",
        youtubeMusic: "https://music.youtube.com",
        featured: false,
        order: 2,
        artistId: nova.id,
      },
    ],
  });

  console.log("✓ Releases creados\n");

  // ─── 6. Videos ───────────────────────────────────────────────────────────────

  await prisma.video.createMany({
    data: [
      {
        title: "VELOZ - FANTASMA (Official Video)",
        youtubeId: "dQw4w9WgXcQ", // Placeholder — cambia por el ID real
        type: "mv",
        order: 1,
        artistId: veloz.id,
      },
      {
        title: "VELOZ - SIN FRENOS (Live Session)",
        youtubeId: "dQw4w9WgXcQ",
        type: "live",
        order: 2,
        artistId: veloz.id,
      },
      {
        title: "LUNA ROJA - MEDIANOCHE (Official Video)",
        youtubeId: "dQw4w9WgXcQ",
        type: "mv",
        order: 1,
        artistId: lunaRoja.id,
      },
      {
        title: "LUNA ROJA - ECLIPSE (Visualizer)",
        youtubeId: "dQw4w9WgXcQ",
        type: "visualizer",
        order: 2,
        artistId: lunaRoja.id,
      },
      {
        title: "NOVA - SIGNAL (Official Video)",
        youtubeId: "dQw4w9WgXcQ",
        type: "mv",
        order: 1,
        artistId: nova.id,
      },
    ],
  });

  console.log("✓ Videos creados\n");

  // ─── 7. Upcoming releases ────────────────────────────────────────────────────

  await prisma.upcoming.createMany({
    data: [
      {
        title: "ZONA CERO",
        artistName: "VELOZ",
        cover: "",
        date: "2026-02-14",
        order: 1,
      },
      {
        title: "LUNA NUEVA",
        artistName: "LUNA ROJA",
        cover: "",
        date: "2026-03-21",
        order: 2,
      },
      {
        title: "ECLIPSE TOTAL",
        artistName: "VELOZ × LUNA ROJA",
        cover: "",
        date: "2026-04-01",
        order: 3,
      },
    ],
  });

  console.log("✓ Upcoming releases creados\n");

  // ─── 8. Link pages de artistas ────────────────────────────────────────────────

  await prisma.linkPage.create({
    data: {
      slug: "veloz",
      title: "VELOZ",
      bio: "Trap Latino • CDMX 🇲🇽",
      avatar: "",
      theme: "dark",
      bgColor: "#0D0D0D",
      accentColor: "#FF4444",
      textColor: "#F0F0F0",
      artistId: veloz.id,
      links: {
        create: [
          { title: "Spotify", url: "https://open.spotify.com", icon: "spotify", order: 1 },
          { title: "Apple Music", url: "https://music.apple.com", icon: "apple", order: 2 },
          { title: "YouTube", url: "https://youtube.com", icon: "youtube", order: 3 },
          { title: "Instagram", url: "https://instagram.com", icon: "instagram", order: 4 },
          { title: "TikTok", url: "https://tiktok.com", icon: "tiktok", order: 5 },
        ],
      },
    },
  });

  await prisma.linkPage.create({
    data: {
      slug: "luna-roja",
      title: "LUNA ROJA",
      bio: "R&B Soul • CDMX 🇲🇽",
      avatar: "",
      theme: "dark",
      bgColor: "#0D0D0D",
      accentColor: "#CC44FF",
      textColor: "#F0F0F0",
      artistId: lunaRoja.id,
      links: {
        create: [
          { title: "Spotify", url: "https://open.spotify.com", icon: "spotify", order: 1 },
          { title: "Apple Music", url: "https://music.apple.com", icon: "apple", order: 2 },
          { title: "YouTube", url: "https://youtube.com", icon: "youtube", order: 3 },
          { title: "Instagram", url: "https://instagram.com", icon: "instagram", order: 4 },
          { title: "TikTok", url: "https://tiktok.com", icon: "tiktok", order: 5 },
        ],
      },
    },
  });

  await prisma.linkPage.create({
    data: {
      slug: "nova",
      title: "NOVA",
      bio: "Electronic • Future Bass • GDL 🇲🇽",
      avatar: "",
      theme: "dark",
      bgColor: "#0D0D0D",
      accentColor: "#00E5FF",
      textColor: "#F0F0F0",
      artistId: nova.id,
      links: {
        create: [
          { title: "Spotify", url: "https://open.spotify.com", icon: "spotify", order: 1 },
          { title: "Apple Music", url: "https://music.apple.com", icon: "apple", order: 2 },
          { title: "YouTube Music", url: "https://music.youtube.com", icon: "youtube", order: 3 },
          { title: "Instagram", url: "https://instagram.com", icon: "instagram", order: 4 },
          { title: "SoundCloud", url: "https://soundcloud.com", icon: "soundcloud", order: 5 },
        ],
      },
    },
  });

  console.log("✓ Link pages creadas\n");

  // ─── Resumen final ────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.artist.count(),
    prisma.release.count(),
    prisma.video.count(),
    prisma.upcoming.count(),
    prisma.linkPage.count(),
  ]);

  console.log("═══════════════════════════════════════");
  console.log("  Seed completado con madre");
  console.log("═══════════════════════════════════════");
  console.log(`  Users:     ${counts[0]}`);
  console.log(`  Artists:   ${counts[1]}`);
  console.log(`  Releases:  ${counts[2]}`);
  console.log(`  Videos:    ${counts[3]}`);
  console.log(`  Upcoming:  ${counts[4]}`);
  console.log(`  LinkPages: ${counts[5]}`);
  console.log("═══════════════════════════════════════\n");
  console.log("  Admin credentials:");
  console.log(`  Username: admin`);
  console.log(`  Password: ${adminPassword}`);
  console.log("\n  ⚠ Cambia la contraseña en producción!\n");

  // Ignoramos el admin en el log de usuarios (ya está arriba)
  void admin;
}

main()
  .catch((err) => {
    console.error("Error en seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
