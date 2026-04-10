"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/cn";
import { getAllReleases } from "@/data/artists";
import type { Release } from "@/types";

gsap.registerPlugin(ScrollTrigger);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formatea "YYYY-MM-DD" a "15 mar 2026" con Intl — sin librerías externas.
 * T00:00:00 evita el off-by-one por timezone en new Date("YYYY-MM-DD").
 */
function formatReleaseDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Constantes ───────────────────────────────────────────────────────────────

// bg-surface-3 sólido + text-accent — sin gradientes
const RELEASE_TYPE_STYLES: Record<Release["type"], { label: string; className: string }> = {
  single: {
    label: "Single",
    className: "bg-surface-3 text-accent border border-border",
  },
  ep: {
    label: "EP",
    className: "bg-surface-3 text-foreground/70 border border-border",
  },
  album: {
    label: "Álbum",
    className: "bg-surface-3 text-foreground/70 border border-border",
  },
};

// ─── Release Card ──────────────────────────────────────────────────────────────

interface ReleaseCardProps {
  release: Release;
}

function ReleaseCard({ release }: ReleaseCardProps) {
  const typeStyle = RELEASE_TYPE_STYLES[release.type];
  const href = release.streamingLinks.spotify ?? "#";

  return (
    <Link
      href={href}
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      aria-label={`Escuchar ${release.title} de ${release.artistName}`}
      className={cn(
        // ancho fijo para que el carrusel GSAP calcule correctamente el scrollDistance
        "w-[280px] sm:w-[300px] lg:w-[320px]",
        "flex-shrink-0 flex flex-col rounded-xl overflow-hidden",
        // colores sólidos del tema — sin gradientes
        "bg-surface-2 border border-border",
        // hover: levanta la card -4px y sube border a accent/50
        "transition-all duration-300",
        "hover:-translate-y-1 hover:border-accent/50",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Cover art: aspect-square — 1:1 */}
      <div className="relative aspect-square overflow-hidden bg-surface-3">
        <Image
          src={release.cover}
          alt={`Portada de ${release.title}`}
          fill
          sizes="(max-width: 640px) 280px, (max-width: 1024px) 300px, 320px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/*
          Overlay hover: bg-black/50 sólido semitransparente.
          NO es un gradiente — rect uniforme para contraste del CTA.
        */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50",
            "opacity-0 hover:opacity-100",
            "transition-opacity duration-300",
          )}
          aria-hidden="true"
        />

        {/* CTA Escuchar — aparece en hover sobre el overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-end justify-center pb-4",
            "opacity-0 hover:opacity-100",
            "translate-y-2 hover:translate-y-0",
            "transition-all duration-300 ease-out",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              "px-4 py-2 rounded-full",
              // bg-accent sólido para máxima legibilidad
              "bg-accent text-background",
              "text-xs font-bold tracking-wider uppercase",
            )}
          >
            <Headphones size={12} aria-hidden="true" />
            Escuchar
          </span>
        </div>

        {/* Badge de tipo — esquina superior izquierda */}
        <span
          className={cn(
            "absolute top-2.5 left-2.5 z-10",
            "text-[10px] font-black tracking-widest uppercase",
            "px-2.5 py-1 rounded",
            typeStyle.className,
          )}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* Info del release */}
      <div className="px-4 py-3.5 flex flex-col gap-1">
        <h3 className="text-foreground font-bold text-base leading-snug line-clamp-2 transition-colors duration-200 hover:text-accent">
          {release.title}
        </h3>
        <p className="text-muted text-sm font-medium truncate">{release.artistName}</p>
        <p className="text-muted/60 text-xs mt-0.5 tabular-nums">
          {formatReleaseDate(release.releaseDate)}
        </p>
      </div>
    </Link>
  );
}

// ─── ReleasesSection ───────────────────────────────────────────────────────────

export function ReleasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  // El wrapper que se va a pinear con ScrollTrigger
  const pinWrapRef = useRef<HTMLDivElement>(null);
  // El contenedor flex de cards que GSAP va a mover con x
  const carouselRef = useRef<HTMLDivElement>(null);

  const releases = getAllReleases();

  useEffect(() => {
    // Necesitamos que el DOM ya tenga dimensiones reales antes de calcular
    // la distancia de scroll. Un pequeño requestAnimationFrame garantiza eso.
    let st: ScrollTrigger | null = null;
    let tween: gsap.core.Tween | null = null;

    const ctx = gsap.context(() => {
      // ─── 1. Heading: fade/slide desde abajo — gsap.from() para progressive enhancement
      if (headingRef.current) {
        gsap.from(
          headingRef.current,
          {
            y: 48,
            opacity: 0,
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

      // ─── 2. Horizontal scroll pinned ───────────────────────────────────────
      if (pinWrapRef.current && carouselRef.current) {
        const carousel = carouselRef.current;
        const wrap = pinWrapRef.current;

        /*
          scrollWidth total del carrusel — offsetWidth del contenedor visible.
          Esa es la distancia real que hay que mover para llegar al último card.
          Añadimos padding extra (48px) para que el último card no quede pegado.
        */
        const getScrollDistance = () =>
          carousel.scrollWidth - wrap.offsetWidth + 48;

        tween = gsap.to(carousel, {
          // x negativo: mueve el carrusel hacia la izquierda mientras scrolleamos
          x: () => -getScrollDistance(),
          ease: "none", // ease: none es fundamental para que el scrub sea 1:1
          scrollTrigger: {
            trigger: wrap,
            /*
              pin: true — fija la sección mientras dura el scroll horizontal.
              scrub: 1 — lag de 1 segundo para sensación suave y no mecánica.
              start/end: el scroll horizontal empieza cuando el top del wrap
              llega al top del viewport y termina cuando se recorrió toda la
              distancia horizontal (scrollWidth del carrusel).
              invalidateOnRefresh: recalcula en resize (crucial en mobile).
            */
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            invalidateOnRefresh: true,
          },
        });

        st = tween.scrollTrigger ?? null;
      }
    }, sectionRef);

    return () => {
      // Cleanup: revert mata todos los ScrollTriggers del contexto
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="releases"
      className="relative w-full bg-background"
      aria-labelledby="releases-heading"
    >
      {/* Separador superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" aria-hidden="true" />

      {/*
        pinWrapRef: este div es el que GSAP va a pinear (position: sticky).
        overflow-hidden es importante para que los cards no se vean fuera del viewport
        durante la animación. min-h-screen garantiza que el pin tenga espacio.
      */}
      <div
        ref={pinWrapRef}
        className="relative w-full overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* Contenido centrado verticalmente dentro del pin */}
        <div className="flex flex-col justify-center h-screen py-16 sm:py-20">
          {/* Heading — GSAP anima este wrapper */}
          <div
            ref={headingRef}
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16"
            id="releases-heading"
          >
            <SectionHeading
              title="Últimos Lanzamientos"
              subtitle="Lo más nuevo de nuestro roster"
              align="left"
            />
          </div>

          {/*
            Contenedor del carrusel: ocupa todo el ancho de pantalla.
            GSAP mueve este div en el eje X con la tween definida arriba.
            horizontal-scroll-section: clase de globals.css con will-change: transform.
            NO tiene overflow-hidden — los cards tienen que salirse del viewport
            mientras GSAP los va revelando.
          */}
          <div
            ref={carouselRef}
            className="horizontal-scroll-section flex gap-5 sm:gap-6"
            style={{
              // Padding izquierdo para que el primer card no quede pegado al borde
              paddingLeft: "clamp(1rem, 4vw, 4rem)",
              // Padding derecho para que el último card respire
              paddingRight: "clamp(1rem, 4vw, 4rem)",
              // El carrusel DEBE ser más ancho que el viewport — no limitar con max-w
              width: "max-content",
            }}
            role="list"
            aria-label="Carrusel de últimos lanzamientos — desplázate hacia abajo para explorar"
          >
            {releases.map((release) => (
              <div key={release.id} role="listitem">
                <ReleaseCard release={release} />
              </div>
            ))}
          </div>

          {/*
            Hint de navegación: le dice al usuario que hay que scrollear.
            Solo visible al inicio antes de que empiece el scroll horizontal.
          */}
          <div
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 flex items-center justify-between"
            aria-hidden="true"
          >
            <p className="text-muted/60 text-xs tabular-nums">
              {releases.length} lanzamiento{releases.length !== 1 ? "s" : ""}
            </p>
            <p className="text-muted/40 text-xs flex items-center gap-1.5">
              <span className="text-sm leading-none">↓</span>
              Scrollea para explorar
              <span className="text-sm leading-none">→</span>
            </p>
          </div>
        </div>
      </div>

      {/* Separador inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
    </section>
  );
}
