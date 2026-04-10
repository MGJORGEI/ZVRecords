import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { artists } from "@/data/artists";
import { genres } from "@/data/genres";
import { cn } from "@/lib/cn";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Nuestros Artistas | ZV Records",
  description:
    "Conoce al roster de ZV Records: los artistas que están cambiando el juego en reggaetón, trap, pop latino, hip-hop y más.",
  openGraph: {
    title: "Nuestros Artistas | ZV Records",
    description: "El talento que está definiendo el sonido del futuro.",
  },
};

// ─── Artist Card ──────────────────────────────────────────────────────────────
// Server Component: sin estado, sin hooks. HTML semántico para SEO.

interface ArtistCardProps {
  artist: (typeof artists)[number];
  priority?: boolean;
}

function ArtistCard({ artist, priority = false }: ArtistCardProps) {
  const genreData = genres.find((g) => g.id === artist.genre);
  const genreName = genreData?.name ?? artist.genre;

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="block group"
      aria-label={`Ver perfil de ${artist.name}`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-surface-2 border border-border",
          "transition-all duration-300",
          "hover:border-accent/50",
        )}
      >
        {/* Imagen con aspect ratio 3:4 */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-3">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay sólido para legibilidad del texto — sin gradiente */}
          <div
            className="absolute inset-0 bg-black/60"
            aria-hidden="true"
          />

          {/* Genre pill */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                "bg-surface-3 text-accent border border-border",
              )}
            >
              {genreName}
            </span>
          </div>

          {/* Contenido inferior */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
            <h2 className="text-foreground font-black text-xl sm:text-2xl lg:text-3xl tracking-tight leading-tight">
              {artist.name}
            </h2>

            <p className="text-foreground/65 text-sm leading-relaxed mt-2 line-clamp-2">
              {artist.shortBio}
            </p>

            {/* CTA */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 mt-3",
                "text-xs font-semibold tracking-widest uppercase",
                "text-muted group-hover:text-accent",
                "transition-colors duration-200",
              )}
            >
              Ver perfil
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function RosterStats() {
  const totalReleases = artists.reduce((acc, a) => acc + a.releases.length, 0);
  const totalVideos = artists.reduce((acc, a) => acc + a.videos.length, 0);
  const uniqueGenres = new Set(artists.map((a) => a.genre)).size;

  const stats = [
    { label: "Artistas", value: artists.length.toString() },
    { label: "Lanzamientos", value: totalReleases.toString() },
    { label: "Videos", value: totalVideos.toString() },
    { label: "Géneros", value: uniqueGenres.toString() },
  ] as const;

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-8">
      {stats.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          {/* Número en accent — sólido, sin text-gradient */}
          <span className="text-3xl sm:text-4xl font-black text-accent tabular-nums">
            {value}
          </span>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ===== Hero header ===== */}
      <header className="bg-surface w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-12 sm:pb-16">

          {/* Eyebrow */}
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-accent mb-4">
            ZV Records — Roster
          </p>

          {/* Título principal — text-foreground, sin text-gradient */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight text-foreground"
          >
            Nuestros
            <br />
            Artistas
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
            El talento que está cambiando el juego. Reggaetón, trap, pop latino,
            hip-hop y más — un roster que rompe fronteras.
          </p>

          {/* Separador sólido */}
          <div
            className="mt-8 w-24 h-[2px] rounded-full bg-accent"
            aria-hidden="true"
          />

          {/* Stats del roster */}
          <RosterStats />
        </div>

        {/* Borde inferior sólido */}
        <div className="h-px bg-border" aria-hidden="true" />
      </header>

      {/* ===== Artists Grid ===== */}
      <section
        className="py-16 sm:py-20 lg:py-24"
        aria-labelledby="artists-grid-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="artists-grid-title" className="sr-only">
            Lista de artistas
          </h2>

          {/* Grid 1 col mobile → 2 tablet → 3 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
            {artists.map((artist, index) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                priority={index < 3}
              />
            ))}
          </div>

          {/* Empty state */}
          {artists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="text-muted text-lg font-medium">
                No hay artistas registrados todavía.
              </p>
              <Link
                href="/"
                className="text-accent text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
