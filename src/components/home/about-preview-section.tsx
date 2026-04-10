"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { artists } from "@/data/artists";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATS: StatItem[] = [
  { value: 6, suffix: "+", label: "Artistas" },
  { value: 50, suffix: "M+", label: "Reproducciones" },
  { value: 100, suffix: "+", label: "Lanzamientos" },
];

// Primeras 4 imágenes del roster para el collage
const COLLAGE_ARTISTS = artists.slice(0, 4);

// ─── Main component ───────────────────────────────────────────────────────────

export function AboutPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Refs para cada pieza animada
  const eyebrowLineRef = useRef<HTMLSpanElement>(null);
  const eyebrowTextRef = useRef<HTMLSpanElement>(null);
  const headlineSomosRef = useRef<HTMLSpanElement>(null);
  // Container de letras de "ZV Records"
  const zvCharsRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  // Imágenes del collage
  const collageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // ── 1. Split "ZV Records" en spans por letra ──────────────────────────
      // Los spans ya están en el JSX como data-char, los seleccionamos por clase
      const chars = section.querySelectorAll<HTMLSpanElement>(".zv-char");

      // ── 1b. El divider no necesita gsap.set() — gsap.from() en la tl lo maneja solo.

      // ── 2. Timeline principal disparada por ScrollTrigger ─────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          // once: no hay toggleActions inverso
          once: true,
        },
        defaults: {
          ease: "power3.out",
        },
      });

      // Eyebrow: línea se dibuja (width de 0 a 32px) — gsap.from() para progressive enhancement
      tl.from(
        eyebrowLineRef.current,
        { width: 0, opacity: 0, duration: 0.5 },
      );

      // Eyebrow: texto aparece
      tl.from(
        eyebrowTextRef.current,
        { opacity: 0, x: -10, duration: 0.4 },
        "-=0.2",
      );

      // "Somos" fade in
      tl.from(
        headlineSomosRef.current,
        { opacity: 0, y: 20, duration: 0.5 },
        "-=0.1",
      );

      // "ZV Records" letra por letra con clip-path vertical — gsap.from()
      if (chars.length > 0) {
        tl.from(
          chars,
          {
            opacity: 0,
            yPercent: 110,
            duration: 0.55,
            stagger: 0.04,
          },
          "-=0.25",
        );
      }

      // Body text fade up
      tl.from(
        bodyRef.current,
        { opacity: 0, y: 24, duration: 0.55 },
        "-=0.2",
      );

      // Stats: fade in del container + countUp numérico
      tl.from(
        statsContainerRef.current,
        { opacity: 0, duration: 0.3 },
        "-=0.1",
      );

      // CountUp con gsap.to + snap + onUpdate para cada stat
      section.querySelectorAll<HTMLSpanElement>(".stat-number").forEach(
        (el, i) => {
          const target = STATS[i].value;
          const proxy = { val: 0 };

          tl.to(
            proxy,
            {
              val: target,
              duration: 1.8,
              ease: "power2.out",
              snap: { val: 1 },
              onUpdate() {
                el.textContent = String(Math.round(proxy.val));
              },
            },
            // Cada contador empieza ligeramente después del anterior
            `<${i * 0.15}`,
          );

          // Fade up individual del bloque
          tl.from(
            el.closest(".stat-block"),
            { opacity: 0, y: 18, duration: 0.45 },
            `<`,
          );
        },
      );

      // Divider — gsap.from() con transformOrigin inlined en la tween
      tl.from(
        dividerRef.current,
        { scaleX: 0, transformOrigin: "left center", duration: 0.5 },
        "-=0.8",
      );

      // CTA
      tl.from(
        ctaRef.current,
        { opacity: 0, y: 14, duration: 0.45 },
        "-=0.4",
      );

      // ── 3. Imágenes del collage con clip-path reveal — gsap.from()
      // GSAP anima desde "inset(100% 0 0 0)" al estado actual del elemento (sin clip).
      collageRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.from(
          el,
          {
            clipPath: "inset(100% 0 0 0)",
            duration: 0.7,
            ease: "power3.inOut",
          },
          // Las imágenes empiezan a revelarse mientras el texto termina
          0.3 + i * 0.12,
        );
      });

      // Badge flotante
      tl.from(
        badgeRef.current,
        { opacity: 0, scale: 0.8, duration: 0.45, ease: "back.out(1.7)" },
        "-=0.3",
      );

      // Label sobre imagen grande
      tl.from(
        labelRef.current,
        { opacity: 0, y: 10, duration: 0.4 },
        "-=0.3",
      );
    }, sectionRef);

    // Cleanup: mata todos los ScrollTriggers del contexto
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 lg:py-32 bg-surface"
      aria-label="Quiénes somos — ZV Records"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left column: Copy + Stats + CTA ── */}
          <div className="flex flex-col gap-8">

            {/* Eyebrow: línea + label */}
            {/*
             * La línea empieza con width:0, GSAP la lleva a 32px.
             * overflow-hidden en el wrapper evita que el texto salte de posición.
             */}
            <div className="flex items-center gap-3">
              <span
                ref={eyebrowLineRef}
                aria-hidden="true"
                className="shrink-0 h-0.5 bg-accent w-8"
              />
              <span
                ref={eyebrowTextRef}
                className="text-accent text-xs font-semibold uppercase tracking-[0.3em]"
              >
                Nuestra historia
              </span>
            </div>

            {/* Headline — split text en "ZV Records" */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              {/*
               * "Somos" anima como bloque, "ZV Records" letra a letra.
               * Cada letra está en overflow-hidden para que el slide vertical
               * no se vea fuera del bounding box del heading.
               */}
              <span
                ref={headlineSomosRef}
                className="text-foreground inline-block"
              >
                Somos
              </span>{" "}
              {/* Wrapper de las letras de "ZV Records" */}
              <span
                ref={zvCharsRef}
                className="text-accent"
                aria-label="ZV Records"
              >
                {"ZV Records".split("").map((char, i) => (
                  <span
                    key={i}
                    // Clase para selección con querySelectorAll
                    className="zv-char inline-block overflow-hidden"
                    // whiteSpace pre para que el espacio no colapse
                    style={{
                      whiteSpace: char === " " ? "pre" : "normal",
                    }}
                    aria-hidden="true"
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h2>

            {/* Body copy */}
            <p
              ref={bodyRef}
              className="text-base sm:text-lg text-muted leading-relaxed max-w-lg"
            >
              Nacimos con una misión: revolucionar la industria musical latina.
              No somos solo una discográfica, somos un movimiento. Cada artista
              que firma con nosotros se convierte en parte de una familia que
              cree en la música sin límites.
            </p>

            {/* Stats — animated counters vía GSAP */}
            <div
              ref={statsContainerRef}
              className="flex flex-wrap gap-8 sm:gap-12"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} className="stat-block flex flex-col gap-1">
                  <div className="flex items-baseline gap-0.5">
                    {/*
                     * data-target: GSAP lee este atributo para saber a qué número llegar.
                     * textContent arranca en "0" y GSAP lo actualiza con onUpdate.
                     */}
                    <span
                      className="stat-number text-5xl sm:text-6xl font-black tabular-nums text-foreground"
                      data-target={stat.value}
                      aria-label={`${stat.value}${stat.suffix}`}
                    >
                      0
                    </span>
                    {/* Sufijo en accent sólido — no lo toca GSAP */}
                    <span className="text-3xl sm:text-4xl font-black text-accent" aria-hidden="true">
                      {stat.suffix}
                    </span>
                  </div>
                  <p className="text-sm text-muted uppercase tracking-widest font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider sólido */}
            {/*
             * scaleX no es propiedad CSS inline válida en TypeScript.
             * GSAP lo setea directamente en el useEffect con gsap.set() antes del tween.
             */}
            <div
              ref={dividerRef}
              aria-hidden="true"
              className="h-px bg-border"
            />

            {/* CTA — borde sólido, sin bg-gradient */}
            <div
              ref={ctaRef}
            >
              <Link
                href="/about"
                className={cn(
                  "group inline-flex items-center gap-3 px-6 py-3.5 rounded-lg",
                  "border border-accent/30 text-accent",
                  "text-sm font-bold tracking-wide uppercase",
                  "transition-colors duration-300",
                  "hover:bg-accent/10 hover:border-accent/60",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none",
                )}
              >
                Conoce nuestra historia
                <ArrowRight
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* ── Right column: 2×2 image collage ── */}
          <div
            className="relative"
            aria-label="Collage de artistas ZV Records"
          >
            {/*
             * Grid 2×2: celda [0] ocupa 2 filas (destacada).
             * Las rotaciones solo en sm+ para no cortarse en mobile.
             */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">

              {/* Celda grande — 2 filas */}
              <div className="row-span-2 h-[300px] sm:h-[420px] sm:-rotate-1">
                <div
                  ref={(el) => { collageRefs.current[0] = el; }}
                  className={cn(
                    "relative overflow-hidden rounded-xl h-full w-full",
                    "border border-border hover:border-accent/60 transition-colors duration-300",
                  )}
                >
                  <Image
                    src={COLLAGE_ARTISTS[0].image}
                    alt={`${COLLAGE_ARTISTS[0].name} — ZV Records`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Overlay de profundidad — bg sólido con opacidad, sin bg-gradient */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-black/30"
                  />
                </div>
              </div>

              {/* Celda top-right */}
              <div className="h-[145px] sm:h-[200px] sm:rotate-1">
                <div
                  ref={(el) => { collageRefs.current[1] = el; }}
                  className={cn(
                    "relative overflow-hidden rounded-xl h-full w-full",
                    "border border-border hover:border-accent/60 transition-colors duration-300",
                  )}
                >
                  <Image
                    src={COLLAGE_ARTISTS[1].image}
                    alt={`${COLLAGE_ARTISTS[1].name} — ZV Records`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-black/30"
                  />
                </div>
              </div>

              {/* Celda bottom-right */}
              <div className="h-[145px] sm:h-[200px] sm:-rotate-1">
                <div
                  ref={(el) => { collageRefs.current[2] = el; }}
                  className={cn(
                    "relative overflow-hidden rounded-xl h-full w-full",
                    "border border-border hover:border-accent/60 transition-colors duration-300",
                  )}
                >
                  <Image
                    src={COLLAGE_ARTISTS[2].image}
                    alt={`${COLLAGE_ARTISTS[2].name} — ZV Records`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-black/30"
                  />
                </div>
              </div>
            </div>

            {/* Cuarta imagen — badge flotante en esquina inferior izquierda */}
            <div
              ref={badgeRef}
              className={cn(
                "absolute -bottom-4 -left-4 w-20 h-20 sm:w-28 sm:h-28",
                "rounded-xl overflow-hidden",
                "border border-border",
                "sm:-rotate-3",
              )}
            >
              <Image
                src={COLLAGE_ARTISTS[3].image}
                alt={`${COLLAGE_ARTISTS[3].name} — ZV Records`}
                fill
                sizes="112px"
                className="object-cover"
              />
              {/* Overlay de profundidad — bg sólido, sin bg-gradient */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-black/30"
              />
            </div>

            {/* Label flotante sobre la imagen grande */}
            <div
              ref={labelRef}
              className={cn(
                "absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1.5 rounded-full",
                "bg-background/80 backdrop-blur-sm border border-border",
                "text-[10px] font-bold tracking-widest uppercase text-accent",
              )}
            >
              Nuestros artistas
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
