"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Instagram,
  Youtube,
  Music,
  Music2,
  Twitter,
  PlayCircle,
  X,
  Eye,
  Calendar,
  Headphones,
  ExternalLink,
  Mic2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Artist, Release, Video } from "@/types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EASE_OUT_CUBIC: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Fade + leve desplazamiento para el contenido de cada tab
const tabContentVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASE_OUT_CUBIC,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

// Cards en cascada
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT_CUBIC },
  },
};

// ─── Tipos de release y video — uniformes, sin colores por tipo ──────────────

const RELEASE_TYPE_LABELS: Record<Release["type"], string> = {
  single: "Single",
  ep: "EP",
  album: "Álbum",
};

const VIDEO_TYPE_LABELS: Record<Video["type"], string> = {
  "music-video": "Music Video",
  clip: "Clip",
  short: "Short",
  live: "Live",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── TikTok Icon (no existe en lucide-react) ──────────────────────────────────

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.53V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────

interface SocialLinksProps {
  socialLinks: Artist["socialLinks"];
}

function SocialLinks({ socialLinks }: SocialLinksProps) {
  const platforms = [
    {
      key: "instagram" as const,
      label: "Instagram",
      icon: <Instagram size={20} />,
    },
    {
      key: "youtube" as const,
      label: "YouTube",
      icon: <Youtube size={20} />,
    },
    {
      key: "spotify" as const,
      label: "Spotify",
      icon: <Music size={20} />,
    },
    {
      key: "appleMusic" as const,
      label: "Apple Music",
      icon: <Music2 size={20} />,
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      icon: <TikTokIcon size={20} />,
    },
    {
      key: "twitter" as const,
      label: "Twitter / X",
      icon: <Twitter size={20} />,
    },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-3" role="list" aria-label="Redes sociales">
      {platforms.map(({ key, label, icon }) => {
        const url = socialLinks[key];
        if (!url) return null;

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguir en ${label}`}
            role="listitem"
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl",
              "bg-surface-2 border border-border",
              "text-muted",
              "transition-all duration-200",
              "hover:border-accent/50 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {icon}
          </a>
        );
      })}
    </div>
  );
}

// ─── Release Card ─────────────────────────────────────────────────────────────

interface ReleaseCardProps {
  release: Release;
}

function ReleaseCard({ release }: ReleaseCardProps) {
  const typeLabel = RELEASE_TYPE_LABELS[release.type];
  const href = release.streamingLinks.spotify ?? "#";

  return (
    <motion.div variants={gridItemVariants}>
      <a
        href={href}
        target={href !== "#" ? "_blank" : undefined}
        rel={href !== "#" ? "noopener noreferrer" : undefined}
        aria-label={`Escuchar ${release.title} en Spotify`}
        className={cn(
          "group flex flex-col rounded-xl overflow-hidden",
          "bg-surface-2 border border-border",
          "transition-all duration-300",
          "hover:border-accent/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        {/* Portada cuadrada */}
        <div className="relative aspect-square overflow-hidden bg-surface-3">
          <Image
            src={release.cover}
            alt={`Portada de ${release.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />

          {/* Overlay sólido en hover para mostrar el CTA */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Botón "Escuchar" */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full",
                "bg-surface/80 border border-border",
                "text-foreground text-xs font-bold tracking-wider uppercase",
              )}
            >
              <Headphones size={12} />
              Escuchar
            </span>
          </div>

          {/* Badge tipo — uniforme para todos los tipos */}
          <span
            className={cn(
              "absolute top-2.5 left-2.5",
              "text-[10px] font-black tracking-widest uppercase",
              "px-2.5 py-1 rounded-full",
              "bg-surface-3 text-accent border border-border",
            )}
          >
            {typeLabel}
          </span>
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col gap-1">
          <h3 className="text-foreground font-bold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
            {release.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-muted">
            <Calendar size={11} />
            <span className="text-[11px] tabular-nums">
              {formatDate(release.releaseDate)}
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

interface VideoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}

function VideoModal({ video, open, onClose }: VideoModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && video && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 focus:outline-none"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
              >
                <div
                  className={cn(
                    "relative w-full max-w-4xl",
                    "bg-surface rounded-xl overflow-hidden",
                    "border border-border",
                  )}
                >
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className={cn(
                        "absolute top-3 right-3 z-10",
                        "flex items-center justify-center w-9 h-9 rounded-lg",
                        "bg-surface-2 border border-border",
                        "text-muted hover:text-foreground",
                        "hover:border-accent/50",
                        "transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      )}
                      aria-label="Cerrar video"
                    >
                      <X size={16} />
                    </button>
                  </Dialog.Close>

                  {/* iframe embed — ratio 16:9 con autoplay */}
                  <div className="relative w-full aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {/* Meta info */}
                  <div className="px-4 py-3 flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-foreground font-bold text-base leading-snug line-clamp-1">
                        {video.title}
                      </Dialog.Title>
                      <p className="text-accent text-sm mt-0.5">
                        {video.artistName}
                      </p>
                    </div>
                    {/* Badge tipo — uniforme */}
                    <span
                      className={cn(
                        "shrink-0 text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full",
                        "bg-surface-3 text-accent border border-border",
                      )}
                    >
                      {VIDEO_TYPE_LABELS[video.type]}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden cursor-pointer",
        "bg-surface-2 border border-border",
        "transition-all duration-300",
        "hover:border-accent/50",
      )}
      onClick={() => onPlay(video)}
      role="button"
      tabIndex={0}
      aria-label={`Reproducir ${video.title}`}
      onKeyDown={(e) => e.key === "Enter" && onPlay(video)}
    >
      {/* Thumbnail 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-surface-3">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay sólido + play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/60 transition-colors duration-300">
          <motion.div
            className="text-foreground opacity-70 group-hover:opacity-100"
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <PlayCircle size={44} className="text-accent" />
          </motion.div>
        </div>

        {/* Badge tipo — uniforme */}
        <span
          className={cn(
            "absolute top-2.5 right-2.5",
            "text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full",
            "bg-surface-3 text-accent border border-border",
          )}
        >
          {VIDEO_TYPE_LABELS[video.type]}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-foreground font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {video.title}
        </h3>
        {video.views && (
          <div className="flex items-center gap-1.5 mt-1">
            <Eye size={12} className="text-muted" />
            <span className="text-xs text-muted">{video.views} vistas</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function BioTab({ artist }: { artist: Artist }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Bio text */}
      <div className="max-w-3xl">
        <p className="text-muted text-base sm:text-lg leading-[1.8] font-normal">
          {artist.bio}
        </p>
      </div>

      {/* Divider sólido */}
      <div className="w-full h-px bg-border" aria-hidden="true" />

      {/* Social links */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-muted flex items-center gap-2">
          <ExternalLink size={12} />
          Sígueme en redes
        </h3>
        <SocialLinks socialLinks={artist.socialLinks} />
      </div>
    </div>
  );
}

function DiscografiaTab({ artist }: { artist: Artist }) {
  if (artist.releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Headphones size={40} className="text-muted" />
        <p className="text-muted text-sm">Sin lanzamientos todavía.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {artist.releases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </motion.div>
  );
}

function VideosTab({ artist }: { artist: Artist }) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlay = useCallback((video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  }, []);

  if (artist.videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <PlayCircle size={40} className="text-muted" />
        <p className="text-muted text-sm">Sin videos todavía.</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {artist.videos.map((video) => (
          <VideoCard key={video.id} video={video} onPlay={handlePlay} />
        ))}
      </motion.div>

      <VideoModal
        video={selectedVideo}
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}

// ─── Tabs Navigation ──────────────────────────────────────────────────────────

type TabId = "bio" | "discografia" | "videos";

interface TabConfig {
  id: TabId;
  label: string;
  count?: number;
}

// ─── Artist Profile (componente principal exportado) ──────────────────────────

interface ArtistProfileProps {
  artist: Artist;
}

export function ArtistProfile({ artist }: ArtistProfileProps) {
  const [activeTab, setActiveTab] = useState<TabId>("bio");

  const tabs: TabConfig[] = [
    { id: "bio", label: "Biografía" },
    {
      id: "discografia",
      label: "Discografía",
      count: artist.releases.length,
    },
    {
      id: "videos",
      label: "Videos",
      count: artist.videos.length,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== Booking CTA ===== */}
        <div
          className={cn(
            "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
            "p-5 sm:p-6 rounded-2xl mb-10 sm:mb-12",
            "bg-surface-2 border border-border",
          )}
        >
          <div className="flex items-center gap-3">
            {/* Ícono con fondo sólido, sin neon */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-surface-3 border border-border",
              )}
              aria-hidden="true"
            >
              <Mic2 size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">
                ¿Quieres booking con {artist.name}?
              </p>
              <p className="text-muted text-xs mt-0.5">
                Contáctanos para fechas, shows y colaboraciones
              </p>
            </div>
          </div>

          {/* variant="outline" como indicado en el brief */}
          <Button asChild variant="outline" size="md">
            <Link href={`/contact?artist=${artist.slug}`}>
              Contactar para Booking
            </Link>
          </Button>
        </div>

        {/* ===== Tabs Navigation ===== */}
        <div
          className="flex items-center gap-1 mb-8 border-b border-border"
          role="tablist"
          aria-label="Secciones del perfil del artista"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-4 sm:px-6 py-3",
                  "text-sm font-semibold tracking-wide",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "cursor-pointer select-none",
                  // Activo: text-accent, inactivo: text-muted con hover
                  isActive ? "text-accent" : "text-muted hover:text-foreground",
                )}
              >
                {tab.label}

                {/* Contador */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "ml-2 inline-flex items-center justify-center",
                      "min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold",
                      // Activo: fondo accent tenue; inactivo: fondo surface-3
                      isActive
                        ? "bg-accent/20 text-accent"
                        : "bg-surface-3 text-muted",
                    )}
                  >
                    {tab.count}
                  </span>
                )}

                {/* Indicador activo — línea sólida bg-accent */}
                {isActive && (
                  <motion.div
                    layoutId="active-artist-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ===== Tab Content con AnimatePresence ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === "bio" && <BioTab artist={artist} />}
            {activeTab === "discografia" && <DiscografiaTab artist={artist} />}
            {activeTab === "videos" && <VideosTab artist={artist} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
