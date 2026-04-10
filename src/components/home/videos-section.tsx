"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, X, Eye } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/cn";
import { getAllVideos } from "@/data/artists";
import type { Video } from "@/types";

gsap.registerPlugin(ScrollTrigger);

// ─── Constantes ───────────────────────────────────────────────────────────────

type FilterTab = "all" | Video["type"];

interface TabConfig {
  id: FilterTab;
  label: string;
}

const TABS: TabConfig[] = [
  { id: "all", label: "Todos" },
  { id: "music-video", label: "Music Videos" },
  { id: "clip", label: "Clips" },
  { id: "short", label: "Shorts" },
  { id: "live", label: "En Vivo" },
];

const TYPE_LABELS: Record<Video["type"], string> = {
  "music-video": "Music Video",
  clip: "Clip",
  short: "Short",
  live: "En Vivo",
};

// ease como tupla tipada — requerido por Framer Motion + TypeScript estricto
const EASE_OUT_CUBIC: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// ─── YouTube Modal ─────────────────────────────────────────────────────────────

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
            {/* Backdrop sólido bg-black/80 — sin gradiente */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/80"
                style={{ backdropFilter: "blur(4px)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                  "w-[calc(100vw-32px)] sm:w-[90vw] max-w-4xl",
                  "focus:outline-none",
                )}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
              >
                {/* bg-surface border-border — colores sólidos del tema */}
                <div className="relative w-full bg-surface border border-border rounded-xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <Dialog.Title className="text-foreground font-semibold text-sm sm:text-base truncate pr-4">
                      {video.title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center",
                          "w-9 h-9 rounded-md",
                          "bg-surface-2 border border-border",
                          "text-muted hover:text-foreground",
                          "transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        )}
                        aria-label="Cerrar video"
                      >
                        <X size={16} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* iframe YouTube */}
                  <div className="relative w-full aspect-video bg-background">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {/* Meta info */}
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-foreground font-bold text-sm leading-snug truncate">
                        {video.title}
                      </p>
                      <p className="text-muted text-xs mt-0.5 truncate">{video.artistName}</p>
                    </div>
                    {video.views && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-muted text-xs">
                        <Eye size={12} aria-hidden="true" />
                        {video.views}
                      </span>
                    )}
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

// ─── Featured Video ────────────────────────────────────────────────────────────

interface FeaturedVideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

function FeaturedVideoCard({ video, onPlay }: FeaturedVideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onPlay(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative w-full aspect-video overflow-hidden rounded-xl cursor-pointer",
        "bg-surface-2 border",
        "transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hovered ? "border-accent/50" : "border-border",
      )}
      aria-label={`Reproducir video destacado: ${video.title}`}
    >
      {/* Thumbnail */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
      </div>

      {/*
        Overlay sólido uniforme — bg-black/40 rect semitransparente.
        SIN gradiente. Solo oscurece para contraste de ícono y texto.
      */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/*
        Segunda capa de oscurecimiento en la mitad inferior — bg-black/60.
        NO es un gradiente: es un rect posicionado absolute bottom-0
        que cubre la mitad de abajo para dar contraste al texto.
      */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/60" aria-hidden="true" />

      {/* Play icon centrado — CSS transform, sin GSAP en hover */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
        style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
        aria-hidden="true"
      >
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full",
            "bg-surface/60 border transition-all duration-300",
            hovered ? "bg-accent/20 border-accent/60" : "border-border",
          )}
        >
          <PlayCircle size={36} className="sm:w-10 sm:h-10 text-foreground" strokeWidth={1.4} />
        </div>
      </div>

      {/* Badge Destacado */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-2.5 py-1 rounded text-[10px] font-black tracking-[0.2em] uppercase bg-accent text-background">
          Destacado
        </span>
      </div>

      {/* Info en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-1">
          {video.artistName}
        </p>
        <h3 className="text-foreground font-black text-xl sm:text-2xl lg:text-3xl leading-tight line-clamp-2">
          {video.title}
        </h3>
        {video.views && (
          <span className="inline-flex items-center gap-1 mt-2 text-muted text-xs">
            <Eye size={12} aria-hidden="true" />
            {video.views} vistas
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onPlay(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group w-full text-left overflow-hidden rounded-xl cursor-pointer",
        "bg-surface-2 border",
        "transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hovered ? "border-accent/50" : "border-border",
      )}
      aria-label={`Reproducir: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-3">
        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
        >
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        {/* Overlay sólido — sin gradiente */}
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-300",
            hovered ? "bg-black/50" : "bg-black/40",
          )}
          aria-hidden="true"
        />

        {/* Play icon — CSS transform hover, sin GSAP */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-200"
          style={{
            transform: hovered ? "scale(1.12)" : "scale(1)",
            opacity: hovered ? 1 : 0.8,
          }}
          aria-hidden="true"
        >
          <PlayCircle className="text-foreground" size={44} strokeWidth={1.4} />
        </div>

        {/* Badge tipo — bg-surface-3 text-accent border-border */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-3 text-accent border border-border">
            {TYPE_LABELS[video.type]}
          </span>
        </div>

        {video.views && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/70 text-foreground text-[10px] font-semibold">
              <Eye size={10} aria-hidden="true" />
              {video.views}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1">
        <p className="text-muted text-xs font-semibold tracking-wider uppercase truncate">
          {video.artistName}
        </p>
        <h3 className="text-foreground font-bold text-sm leading-snug line-clamp-2">
          {video.title}
        </h3>
      </div>
    </button>
  );
}

// ─── VideosSection ─────────────────────────────────────────────────────────────

export function VideosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const allVideos = getAllVideos();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVideos =
    activeFilter === "all" ? allVideos : allVideos.filter((v) => v.type === activeFilter);

  const [featuredVideo, ...restVideos] = filteredVideos;

  const handlePlay = useCallback((video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  }, []);

  // ─── GSAP ScrollTrigger animations ──────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading: text clip desde abajo con fade — gsap.from() para progressive enhancement
      if (headingRef.current) {
        gsap.from(
          headingRef.current,
          {
            y: 50,
            opacity: 0,
            clipPath: "inset(100% 0 0 0)",
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Featured card: scale desde 0.9 con opacity — gsap.from()
      if (featuredRef.current) {
        gsap.from(
          featuredRef.current,
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuredRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // Grid cards: batch stagger entrance — gsap.from()
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-video-card]");
        if (cards.length > 0) {
          gsap.from(
            cards,
            {
              y: 60,
              opacity: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.1,
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 82%",
                toggleActions: "play none none none",
              },
            },
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeFilter]); // Re-dispara animaciones al cambiar filtro

  return (
    <section
      ref={sectionRef}
      id="videos"
      className="relative w-full py-20 sm:py-28 bg-surface overflow-hidden"
      aria-labelledby="videos-heading"
    >
      {/* Separador superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading — GSAP anima este wrapper */}
        <div ref={headingRef} className="mb-10 sm:mb-14" id="videos-heading">
          <SectionHeading
            title="Videos"
            subtitle="Clips, shorts y videos musicales exclusivos"
            align="center"
          />
        </div>

        {/*
          Filter tabs — Framer Motion layoutId para el slide del indicator.
          GSAP no aplica aquí: es interacción directa del usuario, no scroll.
        */}
        <div className="mb-10 sm:mb-12 flex justify-center">
          <div
            className="overflow-x-auto scrollbar-hide pb-1 w-full"
            role="tablist"
            aria-label="Filtrar videos por tipo"
          >
            <div className="flex items-center gap-2 min-w-max px-1">
              {TABS.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      // min-h-[44px]: touch target WCAG mínimo
                      "relative px-4 py-2 min-h-[44px] rounded-full",
                      "text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap",
                      "transition-colors duration-200 cursor-pointer select-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "text-background"
                        : "border border-border text-muted hover:text-foreground hover:border-accent/40 bg-transparent",
                    )}
                  >
                    {/*
                      layoutId: Framer Motion desliza este bg entre el tab activo.
                      bg-accent sólido — sin gradiente.
                    */}
                    {isActive && (
                      <motion.span
                        layoutId="active-video-tab"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Featured video — GSAP anima este wrapper */}
        {featuredVideo && (
          <div ref={featuredRef} className="mb-6 sm:mb-8">
            <FeaturedVideoCard video={featuredVideo} onPlay={handlePlay} />
          </div>
        )}

        {/* Grid de cards — GSAP anima cada [data-video-card] */}
        {restVideos.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {restVideos.map((video) => (
              <div key={video.id} data-video-card>
                <VideoCard video={video} onPlay={handlePlay} />
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {filteredVideos.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <p className="text-muted text-base">Sin videos en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Modal de reproducción */}
      <VideoModal video={selectedVideo} open={isModalOpen} onClose={handleClose} />

      {/* Separador inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
