"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { artists } from "@/data/artists";
import { cn } from "@/lib/cn";

// Registrar plugin fuera del componente — solo se ejecuta una vez
gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Datos estáticos
// ---------------------------------------------------------------------------

const STATS = [
  { value: 6, suffix: "+", label: "Artistas" },
  { value: 50, suffix: "M+", label: "Streams" },
  { value: 12, suffix: "+", label: "Releases" },
] as const;

// "ZV RECORDS" splitteado en chars individuales para el reveal letra a letra
const TITLE_TEXT = "ZV RECORDS";
// Separar en dos palabras para poder ponerles display:block o separar visualmente
const TITLE_CHARS = TITLE_TEXT.split("");

// Ticker: nombres reales de artistas duplicados para loop infinito
const TICKER_NAMES = artists.map((a) => a.name);

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function HeroSection() {
  // Ref del scope para que GSAP solo seleccione dentro de este section
  const sectionRef = useRef<HTMLElement>(null);
  // Refs para las capas que tienen parallax en scroll
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const subtitleWrapRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const vertLineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ======================================================================
      // SECUENCIA DE ENTRADA: timeline maestro, cinematic
      // gsap.from() en lugar de gsap.set() + gsap.to() — progressive enhancement:
      // si GSAP no carga, todos los elementos ya son visibles por defecto.
      // ======================================================================
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // -- 1. Línea horizontal que crece desde el centro — accent color
      //    Empieza con width:0, crece a 100px en 0.6s
      tl.from(
        ".hero-line",
        { scaleX: 0, transformOrigin: "center center", duration: 0.6, ease: "power3.inOut" },
        0,
      );

      // -- 2. Chars del título: cada .char-inner sube desde y:120 con stagger
      //    La clase .char-wrap tiene overflow:hidden así que el char
      //    "sale de abajo como si corriera un telón" — efecto curtain
      tl.from(
        ".hero-char .char-inner",
        {
          y: 120,
          duration: 1,
          stagger: 0.04,
          ease: "power4.out",
        },
        0.3, // empieza un poco después de la línea
      );

      // -- 3. Subtítulo: fade + leve rise
      tl.from(
        ".hero-subtitle",
        { opacity: 0, y: 20, duration: 0.8 },
        1.0,
      );

      // -- 4. Botones CTA: fade + rise escalonado
      tl.from(
        ".hero-cta",
        { opacity: 0, y: 24, duration: 0.7 },
        1.2,
      );

      // -- 5. Stats: aparecen y los números cuentan del 0 al valor final
      tl.from(
        ".hero-stats",
        { opacity: 0, y: 20, duration: 0.7 },
        1.35,
      );

      // Animación de conteo para cada stat
      tl.from(
        ".stat-value",
        {
          textContent: 0,
          duration: 1.4,
          ease: "power2.out",
          snap: { textContent: 1 }, // solo enteros
          stagger: 0.1,
          onUpdate() {
            // textContent se actualiza automáticamente via snap
          },
        },
        1.4,
      );

      // -- 6. Línea vertical decorativa: aparece con fade + crece en height
      tl.from(
        ".hero-vert-line",
        { opacity: 0, scaleY: 0, transformOrigin: "top center", duration: 1.2, ease: "power3.out" },
        0.8,
      );

      // -- 7. Chevron scroll hint: aparece al final + loop bounce infinito
      tl.from(
        ".hero-chevron",
        { opacity: 0, duration: 0.5 },
        1.8,
      );

      // Loop bounce del chevron — corre después de la entrada
      if (chevronRef.current) {
        gsap.to(chevronRef.current, {
          y: 7,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: 2.2,
        });
      }

      // ======================================================================
      // SCROLL PARALLAX con ScrollTrigger
      // Cada capa se mueve a distinta velocidad → ilusión de profundidad 3D
      // ======================================================================

      const scrollConfig = {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.2, // suavizado con retraso — más cinematic
      };

      // Título: se mueve más rápido hacia arriba (capa más "cercana")
      if (titleWrapRef.current) {
        gsap.to(titleWrapRef.current, {
          y: -180,
          ease: "none",
          scrollTrigger: scrollConfig,
        });
      }

      // Subtítulo: velocidad media
      if (subtitleWrapRef.current) {
        gsap.to(subtitleWrapRef.current, {
          y: -100,
          ease: "none",
          scrollTrigger: scrollConfig,
        });
      }

      // CTAs: velocidad más lenta (capa más "lejana")
      if (ctaWrapRef.current) {
        gsap.to(ctaWrapRef.current, {
          y: -60,
          ease: "none",
          scrollTrigger: scrollConfig,
        });
      }

      // Línea vertical: sube con velocidad distinta — efecto de profundidad
      if (vertLineRef.current) {
        gsap.to(vertLineRef.current, {
          y: -240,
          ease: "none",
          scrollTrigger: scrollConfig,
        });
      }

      // Stats: se quedan casi fijos (capa de fondo)
      if (statsRef.current) {
        gsap.to(statsRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: scrollConfig,
        });
      }

      // ======================================================================
      // HOVER MAGNÉTICO en los botones CTA
      // ======================================================================
      const magneticEls = sectionRef.current?.querySelectorAll(".magnetic");
      magneticEls?.forEach((el) => {
        const onEnter = (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = (el as HTMLElement).getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left - rect.width / 2;
          const y = mouseEvent.clientY - rect.top - rect.height / 2;
          gsap.to(el, {
            x: x * 0.25,
            y: y * 0.25,
            duration: 0.3,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
        };
        el.addEventListener("mousemove", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    }, sectionRef);

    // Cleanup: mata todos los ScrollTriggers y tweens del contexto
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col overflow-hidden bg-background"
      aria-label="ZV Records — Inicio"
    >
      {/* ================================================================
          FONDO: círculo accent sólido con blur extremo
          bg-accent sólido + blur-[150px] = halo de luz sin gradiente
          ================================================================ */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Orb principal — esquina superior izquierda */}
        <div
          className="absolute rounded-full bg-accent opacity-[0.03] blur-[150px]"
          style={{ width: 700, height: 700, top: "-15%", left: "-10%" }}
        />
        {/* Orb secundario — esquina inferior derecha */}
        <div
          className="absolute rounded-full bg-accent opacity-[0.025] blur-[150px]"
          style={{ width: 500, height: 500, bottom: "-10%", right: "-5%" }}
        />
      </div>

      {/* ================================================================
          LÍNEA VERTICAL DECORATIVA — parallax en scroll
          1px de ancho, color accent/20, altura 40vh
          ================================================================ */}
      <div
        ref={vertLineRef}
        className="hero-vert-line absolute right-8 sm:right-14 lg:right-20 top-[15%] z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="bg-accent/20"
          style={{ width: 1, height: "40vh" }}
        />
        {/* Punto al final de la línea */}
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 -ml-px mt-1" />
      </div>

      {/* ================================================================
          CONTENIDO PRINCIPAL
          ================================================================ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-32 sm:pt-24 sm:pb-28">

        {/* --- Línea horizontal de apertura --- */}
        {/*
          La línea empieza con scaleX:0 y GSAP la lleva a scaleX:1.
          transformOrigin:"center center" hace que crezca desde el centro.
        */}
        <div className="mb-10 sm:mb-12 flex items-center justify-center">
          <div
            className="hero-line bg-accent"
            style={{ width: 100, height: 1 }}
            aria-hidden="true"
          />
        </div>

        {/* --- Título MASIVO con split de chars --- */}
        <div ref={titleWrapRef} className="text-center mb-6 sm:mb-8">
          <h1
            className={cn(
              "font-black tracking-tighter leading-[0.85] text-foreground",
              // clamp: mínimo 3rem, preferido 15vw, máximo 12rem
              // esto garantiza que sea el centerpiece visual absoluto
            )}
            style={{
              fontSize: "clamp(3rem, 15vw, 12rem)",
            }}
            aria-label={TITLE_TEXT}
          >
            {/*
              Cada carácter está envuelto en:
              <span class="char-wrap hero-char">   ← overflow:hidden actúa como "foso"
                <span class="char-inner">LETRA</span>  ← GSAP anima y: 120 → 0
              </span>
              El espacio entre "ZV" y "RECORDS" se maneja con un span especial.
            */}
            {TITLE_CHARS.map((char, idx) => {
              if (char === " ") {
                // Espacio: no wrap, solo un gap visual
                return (
                  <span
                    key={`space-${idx}`}
                    className="inline-block"
                    style={{ width: "0.3em" }}
                    aria-hidden="true"
                  />
                );
              }
              return (
                <span
                  key={`char-${idx}`}
                  className="char-wrap hero-char inline-block"
                  // overflow:hidden ya definido en globals.css via .char-wrap
                >
                  <span className="char-inner inline-block">
                    {char}
                  </span>
                </span>
              );
            })}
          </h1>
        </div>

        {/* --- Subtítulo --- */}
        <div ref={subtitleWrapRef}>
          <p
            className="hero-subtitle text-muted text-lg sm:text-xl font-light tracking-wide max-w-md text-center"
          >
            Donde el talento se convierte en leyenda
          </p>
        </div>

        {/* --- CTAs --- */}
        <div
          ref={ctaWrapRef}
          className="hero-cta mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto"
        >
          <Button
            asChild
            variant="default"
            size="lg"
            className="magnetic w-full sm:w-auto"
          >
            <Link href="/artists">Explorar Artistas</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="magnetic w-full sm:w-auto"
          >
            <Link href="/#releases">Escuchar Ahora</Link>
          </Button>
        </div>

        {/* --- Stats con counter animado --- */}
        <div
          ref={statsRef}
          className="hero-stats mt-12 sm:mt-14 flex items-center gap-8 sm:gap-14"
          role="list"
          aria-label="Estadísticas de ZV Records"
        >
          {STATS.map(({ value, suffix, label }, idx) => (
            <div
              key={label}
              className="relative flex flex-col items-center gap-1"
              role="listitem"
            >
              {/* Separador vertical entre items — solo sm+ */}
              {idx > 0 && (
                <span
                  className="hidden sm:block absolute -left-7 top-1/2 -translate-y-1/2 h-8 w-px bg-border"
                  aria-hidden="true"
                />
              )}
              {/*
                data-value es el número final que GSAP cuenta.
                El span tiene el número inicial (el value real) ya que
                GSAP anima textContent desde 0 vía snap:{textContent:1}.
                El suffix se muestra en un span separado para que el
                counter no lo sobreescriba.
              */}
              <div className="flex items-baseline gap-0.5">
                <span
                  className="stat-value text-2xl sm:text-3xl font-black text-foreground tabular-nums"
                  data-value={value}
                >
                  {value}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {suffix}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-muted tracking-[0.18em] uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
          SEPARADOR + TICKER MARQUEE
          ================================================================ */}
      <div
        className="relative z-10 w-full overflow-hidden border-t border-border/40 py-3"
        aria-hidden="true"
      >
        {/*
          "Fade" lateral sin gradiente:
          dos bloques con bg-background sólido en los extremos.
          Se superponen al ticker con z-index mayor.
          El efecto de desvanecimiento es simplemente color sólido
          tapando los extremos del texto en movimiento.
        */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-background z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-background z-10 pointer-events-none" />

        {/* Track animado — ticker-scroll definido en globals.css */}
        <div
          className="flex"
          style={{ animation: "ticker-scroll 28s linear infinite" }}
        >
          {/* 4 copias para scroll infinito sin cortes */}
          {Array.from({ length: 4 }).map((_, outerIdx) => (
            <div key={outerIdx} className="flex items-center shrink-0">
              {TICKER_NAMES.map((name, idx) => (
                <span key={`${outerIdx}-${idx}`} className="flex items-center">
                  <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-foreground/25 whitespace-nowrap px-4">
                    {name}
                  </span>
                  {/* Separador decorativo — carácter unicode, sin gradiente */}
                  <span className="text-accent/30 text-[9px] select-none">
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
          SCROLL HINT — chevron animado con GSAP loop
          ================================================================ */}
      <div
        className="hero-chevron relative z-10 flex justify-center pb-6 -mt-1"
        aria-hidden="true"
      >
        {/* ref en el wrapper div — tipo-safe, sin depender de forwardRef de Lucide */}
        <div ref={chevronRef} className="inline-flex">
          <ChevronDown
            className="text-foreground/25"
            size={26}
            strokeWidth={1.5}
          />
        </div>
      </div>
    </section>
  );
}
