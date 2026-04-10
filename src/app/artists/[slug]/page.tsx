import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { artists, getArtistBySlug } from "@/data/artists";
import { genres } from "@/data/genres";
import { ArtistProfile } from "@/components/artists/artist-profile";
import { cn } from "@/lib/cn";

// ─── Static Params ─────────────────────────────────────────────────────────────
// Genera rutas estáticas en build time para cada artista.

export function generateStaticParams(): Array<{ slug: string }> {
  return artists.map((artist) => ({
    slug: artist.slug,
  }));
}

// ─── Metadata dinámica ─────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    return {
      title: "Artista no encontrado | ZV Records",
    };
  }

  const genreData = genres.find((g) => g.id === artist.genre);
  const genreName = genreData?.name ?? artist.genre;

  return {
    title: `${artist.name} | ZV Records`,
    description: `${artist.shortBio} — ${genreName}. Conoce su discografía, videos y más en ZV Records.`,
    openGraph: {
      title: `${artist.name} — ZV Records`,
      description: artist.bio.slice(0, 160),
      images: [
        {
          url: artist.coverImage,
          width: 1920,
          height: 1080,
          alt: `${artist.name} — ZV Records`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${artist.name} | ZV Records`,
      description: artist.shortBio,
      images: [artist.coverImage],
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  // notFound() lanza el error especial de Next.js → renderiza not-found.tsx
  if (!artist) {
    notFound();
  }

  const genreData = genres.find((g) => g.id === artist.genre);
  const genreName = genreData?.name ?? artist.genre;

  return (
    <main className="min-h-screen bg-background">

      {/* ===== Hero section — cover image full width ===== */}
      <header
        className="relative w-full h-[50vh] min-h-[400px] overflow-hidden"
        aria-label={`Hero de ${artist.name}`}
      >
        {/* Cover image optimizada con next/image */}
        <Image
          src={artist.coverImage}
          alt={`${artist.name} — imagen de portada`}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Overlay sólido para legibilidad — SIN gradiente */}
        <div
          className="absolute inset-0 bg-black/50"
          aria-hidden="true"
        />

        {/* Contenido posicionado en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">

            {/* Genre badge — colores sólidos del tema */}
            <div className="mb-3 sm:mb-4">
              <span
                className={cn(
                  "inline-block px-3 py-1.5 rounded-full",
                  "text-[11px] font-black tracking-[0.2em] uppercase",
                  "bg-surface-3 text-accent border border-border",
                )}
              >
                {genreName}
              </span>
            </div>

            {/* Nombre del artista — huge */}
            <h1
              className={cn(
                "text-6xl sm:text-7xl lg:text-8xl xl:text-9xl",
                "font-black leading-[0.85] tracking-tight",
                "text-foreground",
              )}
            >
              {artist.name}
            </h1>

            {/* Short bio */}
            <p className="mt-4 text-foreground/60 text-base sm:text-lg max-w-xl leading-relaxed">
              {artist.shortBio}
            </p>
          </div>
        </div>
      </header>

      {/* ===== Artist Profile — client component con tabs ===== */}
      {/*
        Hero es Server Component (imagen, nombre, género — todo estático).
        ArtistProfile es Client Component (tabs, modal de video, estado).
      */}
      <ArtistProfile artist={artist} />
    </main>
  );
}
