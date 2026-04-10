"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { artists } from "@/data/artists"
import { genres } from "@/data/genres"
import { cn } from "@/lib/cn"
import type { Artist, Genre } from "@/types"

// GSAP plugin — registrar una sola vez al nivel de módulo
gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// GenrePill
// Framer Motion solo para el fondo deslizante del pill activo (layoutId).
// El resto de la sección es 100% GSAP.
// ---------------------------------------------------------------------------

interface GenrePillProps {
  genre: Genre
  active: boolean
  onClick: () => void
}

function GenrePill({ genre, active, onClick }: GenrePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative shrink-0 px-4 py-2 min-h-[40px] rounded-full",
        "text-xs font-bold tracking-widest uppercase whitespace-nowrap",
        "border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-accent text-background"
          : "border-border text-muted hover:border-accent/40 hover:text-foreground",
      )}
    >
      {/* Fondo cyan que se desliza con spring entre pills — solo Framer Motion aquí */}
      {active && (
        <motion.span
          layoutId="artists-genre-pill-bg"
          className="absolute inset-0 rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{genre.name}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// ArtistCard
// GSAP controla: clip-path reveal de la imagen (ScrollTrigger por card).
// CSS transition maneja: hover scale de imagen, hover border.
// La card entera (opacity, y, scale, rotation) la controla el batch del padre.
// ---------------------------------------------------------------------------

interface ArtistCardProps {
  artist: Artist
  index: number
}

function ArtistCard({ artist, index }: ArtistCardProps) {
  const imageWrapRef = useRef<HTMLDivElement>(null)

  const genreLabel = genres.find((g) => g.id === artist.genre)?.name ?? artist.genre

  useEffect(() => {
    const el = imageWrapRef.current
    if (!el) return

    // Clip-path reveal: la imagen aparece de abajo hacia arriba
    // inset(100% 0% 0% 0%) → inset(0% 0% 0% 0%)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    // data-artist-card: selector que usa ScrollTrigger.batch del padre
    // Las props de transform iniciales se sobreescriben por GSAP al montar el batch
    <Link
      href={`/artists/${artist.slug}`}
      data-artist-card
      aria-label={`Ver perfil de ${artist.name}`}
      className={cn(
        "group block rounded-xl overflow-hidden",
        "border border-border bg-surface-2",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-accent/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.10)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        // GSAP arranca la card invisible; este estilo inline es el punto de partida
        // que GSAP va a animar. No usar clase opacity-0 para no luchar con Tailwind.
      )}
    >
      {/* Imagen: aspect-[3/4] — formato retrato, máximo impacto artístico */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-3">

        {/* Wrapper del clip-path reveal — GSAP anima desde inset(100%) */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0"
        >
          <Image
            src={artist.image}
            alt={`Foto de ${artist.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={index < 3}
          />
        </div>

        {/*
          Overlay de legibilidad: rect sólido semitransparente en el 65% inferior.
          bg-black/60 — CERO gradiente, CERO linear-gradient.
          El efecto de "fundido" viene del blur natural que hay entre imagen y overlay.
        */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[65%] bg-black/60"
          aria-hidden="true"
        />

        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5 flex flex-col gap-2">
          {/* Genre pill — bg-surface-3 sólido, SIN color de género (CERO gradiente) */}
          <span className="self-start px-2.5 py-1 rounded-full bg-surface-3 border border-border/60 text-accent text-[10px] font-bold tracking-widest uppercase">
            {genreLabel}
          </span>

          {/* Nombre del artista */}
          <h3 className="text-foreground font-black text-xl sm:text-2xl leading-tight tracking-tight">
            {artist.name}
          </h3>

          {/* Short bio: aparece en hover con CSS transition */}
          <p className="text-foreground/60 text-xs leading-snug line-clamp-2 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
            {artist.shortBio}
          </p>
        </div>

        {/* Arrow icon — esquina superior derecha, aparece en hover */}
        <div
          className={cn(
            "absolute top-4 right-4 z-10",
            "w-8 h-8 rounded-full bg-surface-3 border border-border",
            "flex items-center justify-center",
            "opacity-0 scale-75 transition-all duration-300 ease-out",
            "group-hover:opacity-100 group-hover:scale-100",
          )}
          aria-hidden="true"
        >
          <ArrowUpRight className="w-4 h-4 text-accent" />
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// ArtistsSection
// ---------------------------------------------------------------------------

export function ArtistsSection() {
  const [activeGenre, setActiveGenre] = useState<string>("all")

  // Refs para targets de GSAP
  const sectionRef = useRef<HTMLElement>(null)
  const headingBlockRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const filteredArtists: Artist[] =
    activeGenre === "all"
      ? artists
      : artists.filter((a) => a.genre === activeGenre)

  // Palabras del título para el reveal word-by-word
  const titleWords = ["Nuestros", "Artistas"]

  // Helper ref callback — evita recrear el array en cada render
  const setWordRef = useCallback(
    (el: HTMLSpanElement | null, i: number) => {
      wordRefs.current[i] = el
    },
    [],
  )

  // -------------------------------------------------------------------------
  // GSAP: Heading animations + parallax
  // Solo corre una vez al montar el componente.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {

      // 1. Línea decorativa: scaleX de 0 → 1 desde la izquierda
      if (lineRef.current) {
        gsap.from(
          lineRef.current,
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingBlockRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        )
      }

      // 2. Palabras del título: clip-path + y translate, staggered
      const words = wordRefs.current.filter((w): w is HTMLSpanElement => w !== null)
      if (words.length) {
        gsap.from(
          words,
          {
            y: 56,
            opacity: 0,
            // clipPath arranca cubriendo desde abajo — gsap.from() lo lleva a inset(0%)
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: headingBlockRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        )
      }

      // 3. Subtitle fade-up
      if (subtitleRef.current) {
        gsap.from(
          subtitleRef.current,
          {
            y: 24,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: subtitleRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        )
      }

      // 4. Filter pills fade-up
      if (filterRef.current) {
        gsap.from(
          filterRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: filterRef.current,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          },
        )
      }

      // 5. CTA button fade-up
      if (ctaRef.current) {
        gsap.from(
          ctaRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          },
        )
      }

      // 6. Parallax sutil en el bloque heading completo
      //    El heading sube levemente mientras el usuario scrollea por la sección
      if (headingBlockRef.current) {
        gsap.to(headingBlockRef.current, {
          y: -48,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "center top",
            scrub: 1.5,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // -------------------------------------------------------------------------
  // GSAP: ScrollTrigger.batch para las cards
  // Se re-ejecuta cuando cambia activeGenre (nuevas cards en el DOM).
  // -------------------------------------------------------------------------
  useEffect(() => {
    // requestAnimationFrame: asegura que React ya hizo flush del nuevo DOM
    // antes de que GSAP busque los elementos [data-artist-card]
    let rafId: number
    let batchCtx: ReturnType<typeof gsap.context> | null = null

    rafId = requestAnimationFrame(() => {
      const cards = gridRef.current
        ? Array.from(gridRef.current.querySelectorAll<HTMLAnchorElement>("[data-artist-card]"))
        : []

      if (!cards.length) return

      batchCtx = gsap.context(() => {
        ScrollTrigger.batch(cards, {
          start: "top 90%",
          // Máximo 3 cards por batch para que el stagger sea visible
          batchMax: 3,

          // gsap.from() — los elementos ya son visibles por defecto.
          // GSAP anima DESDE el estado oculto HACIA el estado actual.
          // Progressive enhancement: sin GSAP, las cards se ven normales.
          onEnter: (batch) => {
            gsap.from(batch, {
              opacity: 0,
              y: 80,
              scale: 0.95,
              rotation: (i: number) => (i % 2 === 0 ? -1.5 : 1.5),
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.09,
              overwrite: true,
            })
          },

          // Re-oculta si el usuario sube y las cards salen por arriba
          onLeaveBack: (batch) => {
            gsap.to(batch, {
              opacity: 0,
              y: 80,
              scale: 0.95,
              rotation: (i: number) => (i % 2 === 0 ? -1.5 : 1.5),
              duration: 0.4,
              ease: "power2.in",
              stagger: 0.05,
              overwrite: true,
            })
          },
        })
      })
    })

    return () => {
      cancelAnimationFrame(rafId)
      // Limpiar los ScrollTriggers del batch al cambiar filtro o desmontar
      if (batchCtx) batchCtx.revert()
    }
  }, [activeGenre])

  return (
    <section
      ref={sectionRef}
      id="artists"
      aria-labelledby="artists-section-heading"
      className="relative w-full py-24 sm:py-32 bg-background overflow-hidden"
    >
      {/* Separador superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ----------------------------------------------------------------- */}
        {/* Heading block                                                       */}
        {/* ----------------------------------------------------------------- */}
        <div ref={headingBlockRef} className="mb-12 sm:mb-16 flex flex-col gap-4">

          {/* Línea decorativa accent — GSAP anima scaleX desde 0 */}
          <div
            ref={lineRef}
            className="w-10 h-0.5 rounded-full bg-accent"
            style={{ transformOrigin: "left center" }}
            aria-hidden="true"
          />

          {/* Título: cada palabra en su wrapper overflow-hidden para el clip reveal */}
          <h2
            id="artists-section-heading"
            // El label completo es para screen readers
            aria-label={titleWords.join(" ")}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground"
          >
            {titleWords.map((word, i) => (
              /*
                overflow-hidden en el wrapper: el clip-path de la palabra interior
                no "derrama" fuera, dando el efecto de reveal limpio desde el fondo.
              */
              <span
                key={word}
                className="inline-block overflow-hidden mr-[0.3em] last:mr-0"
                aria-hidden="true"
              >
                <span
                  ref={(el) => setWordRef(el, i)}
                  className="inline-block"
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-base sm:text-lg text-muted max-w-xl leading-relaxed"
          >
            Talento sin filtros. Música que define una generación.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Genre filter                                                        */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={filterRef}
          className="mb-10 sm:mb-12"
          role="group"
          aria-label="Filtrar artistas por género"
        >
          {/* overflow-x-auto en mobile, flex-wrap en desktop */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible">
            {genres.map((genre) => (
              <GenrePill
                key={genre.id}
                genre={genre}
                active={activeGenre === genre.id}
                onClick={() => setActiveGenre(genre.id)}
              />
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Grid de artistas                                                    */}
        {/* AnimatePresence con mode="wait" para la transición entre filtros    */}
        {/* GSAP ScrollTrigger.batch se encarga de las cards individuales       */}
        {/* ----------------------------------------------------------------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${activeGenre}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {filteredArtists.length > 0 ? (
              <div
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
                id="artists-grid"
                role="list"
                aria-label="Lista de artistas"
              >
                {filteredArtists.map((artist, index) => (
                  <div key={artist.id} role="listitem">
                    <ArtistCard artist={artist} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              // Estado vacío cuando el género no tiene artistas
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <p className="text-muted text-base font-medium">
                  No hay artistas en este género todavía.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveGenre("all")}
                  className={cn(
                    "text-accent text-sm underline underline-offset-4",
                    "hover:text-foreground transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1",
                  )}
                >
                  Ver todos los artistas
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ----------------------------------------------------------------- */}
        {/* CTA — ver todos los artistas                                        */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={ctaRef}
          className="flex justify-center mt-12 sm:mt-16"
        >
          <Link
            href="/artists"
            className={cn(
              "group inline-flex items-center gap-2",
              "px-7 py-3 min-h-[48px] rounded-full",
              "border border-border text-muted text-sm font-semibold tracking-wide",
              "transition-colors duration-200",
              "hover:border-accent/60 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Ver todos los artistas
            <ArrowUpRight
              className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {/* Separador inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
    </section>
  )
}
