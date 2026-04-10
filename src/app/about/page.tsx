import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Heart, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// ─── SEO ──────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Nuestra Historia | ZV Records",
  description:
    "Conoce la historia, misión y valores de ZV Records — el sello discográfico que está revolucionando la música latina desde 2023.",
  openGraph: {
    title: "Nuestra Historia | ZV Records",
    description:
      "De un sueño a 50M de reproducciones. La historia de cómo ZV Records está cambiando la música latina.",
    type: "website",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: "2023",
    title: "El Inicio",
    description:
      "ZV Records nace con la visión de revolucionar la música latina. Un estudio, una visión, y la convicción de que el talento merecía una plataforma diferente.",
  },
  {
    year: "2024",
    title: "Primeros Artistas",
    description:
      "Firmamos nuestros primeros 3 artistas que romperían esquemas. Cada uno con un sonido único, todos con el hambre de dejar huella en la industria.",
  },
  {
    year: "2025",
    title: "Expansión Digital",
    description:
      "50 millones de reproducciones y presencia en todas las plataformas. Lo que empezó como una apuesta se convirtió en un movimiento cultural real.",
  },
  {
    year: "2026",
    title: "El Futuro",
    description:
      "Nuevos artistas, giras internacionales, y más música que nunca. ZV Records no para — esto apenas es el arranque de algo mucho más grande.",
  },
];

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Timeline — línea vertical bg-border, dots bg-accent, año text-accent
function TimelineSection() {
  return (
    <section
      className="relative py-20 lg:py-32 overflow-hidden"
      aria-labelledby="timeline-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        {/* Separador sólido */}
        <div
          className="w-16 h-0.5 rounded-full bg-accent mx-auto mb-6"
          aria-hidden="true"
        />
        <h2
          id="timeline-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground"
        >
          Nuestra Línea del Tiempo
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto text-base sm:text-lg">
          Cada año, un nuevo capítulo. Cada paso, una historia de dedicación.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Línea vertical — sólida bg-border, desktop centrada */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border"
        />

        {/* Línea vertical mobile */}
        <div
          aria-hidden="true"
          className="lg:hidden absolute left-5 top-0 bottom-0 w-px bg-border"
        />

        <ol
          className="relative flex flex-col gap-16 lg:gap-20"
          aria-label="Cronología de ZV Records"
        >
          {TIMELINE_ITEMS.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <li key={item.year} className="relative pl-12 lg:pl-0">
                {/* Dot mobile — bg-accent sólido */}
                <div
                  className="lg:hidden absolute left-3.5 top-6 w-3 h-3 rounded-full -translate-x-1/2 bg-accent ring-4 ring-background"
                  aria-hidden="true"
                />

                {/* Año mobile */}
                <span className="lg:hidden block text-3xl font-black mb-3 text-accent">
                  {item.year}
                </span>

                {/* Layout desktop: dos columnas alternadas */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_160px_1fr] items-start gap-0">
                  {/* Columna izquierda — items pares */}
                  <div className={isEven ? "pr-8 text-right" : "opacity-0 pointer-events-none"}>
                    {isEven && (
                      <div
                        className={cn(
                          "rounded-2xl bg-surface-2 border border-border p-6",
                          "transition-all duration-300 group",
                          "hover:border-accent/50",
                        )}
                      >
                        <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Centro: año + dot */}
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <span
                      className="text-4xl xl:text-5xl font-black leading-none tabular-nums text-accent"
                      aria-label={`Año ${item.year}`}
                    >
                      {item.year}
                    </span>
                    {/* Dot — bg-accent sólido */}
                    <div
                      className="w-4 h-4 rounded-full bg-accent ring-4 ring-background mt-1"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Columna derecha — items impares */}
                  <div className={!isEven ? "pl-8" : "opacity-0 pointer-events-none"}>
                    {!isEven && (
                      <div
                        className={cn(
                          "rounded-2xl bg-surface-2 border border-border p-6",
                          "transition-all duration-300 group",
                          "hover:border-accent/50",
                        )}
                      >
                        <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card mobile */}
                <div
                  className={cn(
                    "lg:hidden rounded-2xl bg-surface-2 border border-border p-6",
                    "transition-all duration-300",
                    "hover:border-accent/50",
                  )}
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function ValueCardComponent({ card }: { card: ValueCard }) {
  return (
    <article
      className={cn(
        "group rounded-2xl bg-surface-2 border border-border p-8",
        "flex flex-col items-center text-center gap-5",
        "transition-all duration-300 hover:-translate-y-1",
        "hover:border-accent/50",
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center",
          "bg-surface-3 border border-border text-accent",
          "transition-colors duration-300 group-hover:bg-accent/10",
        )}
        aria-hidden="true"
      >
        {card.icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
        <p className="text-sm text-muted leading-relaxed">{card.description}</p>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const valueCards: ValueCard[] = [
    {
      icon: <Lightbulb className="w-7 h-7" />,
      title: "Innovación",
      description:
        "Empujamos los límites del sonido latino. Fusionamos géneros, abrazamos la tecnología y apostamos por ideas que otros no se atreven a probar.",
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Autenticidad",
      description:
        "Sin máscaras, sin fórmulas. Cada artista en ZV Records cuenta su propia historia con su propia voz — eso es lo que conecta de verdad.",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Comunidad",
      description:
        "El éxito es colectivo. Construimos una familia de artistas, productores y fans que se apoyan mutuamente y crecen juntos.",
    },
  ];

  return (
    <main className="min-h-screen bg-background" aria-label="Página Nuestra Historia">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section
        className="bg-surface py-20"
        aria-labelledby="about-hero-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">

          {/* Tag de contexto — sólido, sin orbs ni glows */}
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full mb-8",
              "border border-border bg-surface-2 px-4 py-1.5",
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
            <span className="text-xs text-muted uppercase tracking-widest font-semibold">
              ZV Records — Desde 2023
            </span>
          </div>

          {/* Heading principal — text-foreground */}
          <h1
            id="about-hero-heading"
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight text-foreground mb-6"
          >
            Nuestra Historia
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            De un sueño a un movimiento. Conoce cómo ZV Records se convirtió en
            el sello que está redefiniendo la música latina.
          </p>
        </div>

        {/* Borde inferior */}
        <div className="h-px bg-border mt-8" aria-hidden="true" />
      </section>

      {/* ── Timeline Section ────────────────────────────────────────────────── */}
      <TimelineSection />

      {/* ── Mission Section ──────────────────────────────────────────────────── */}
      <section
        className="relative py-20 lg:py-28 bg-surface"
        aria-labelledby="mission-heading"
      >
        {/* Bordes superior e inferior sólidos */}
        <div className="absolute top-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Separador sólido */}
          <div
            className="w-16 h-0.5 rounded-full bg-accent mx-auto mb-8"
            aria-hidden="true"
          />

          <h2
            id="mission-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-8"
          >
            Nuestra Misión
          </h2>

          <p className="text-xl sm:text-2xl text-foreground/70 leading-relaxed font-light mb-6">
            Empoderar a los artistas latinos para que cuenten sus historias
            con libertad creativa total y el respaldo de un equipo que cree
            en ellos desde el primer día.
          </p>

          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            En ZV Records no firmamos artistas — construimos carreras. Cada decisión
            que tomamos está guiada por el respeto al talento, la honestidad con el
            proceso creativo y el compromiso de llevar la música latina a donde merece estar: en lo más alto del mundo.
          </p>

          {/* Stats row — sólidos */}
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            aria-label="Logros de ZV Records"
          >
            {[
              { value: "50M+", label: "Reproducciones" },
              { value: "6", label: "Artistas" },
              { value: "3", label: "Años" },
              { value: "∞", label: "Potencial" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-5 rounded-2xl bg-surface-2 border border-border"
              >
                {/* Valor en accent — sin text-gradient */}
                <span className="text-3xl sm:text-4xl font-black text-accent">
                  {stat.value}
                </span>
                <span className="text-xs text-muted uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values Section ───────────────────────────────────────────────────── */}
      <section
        className="relative py-20 lg:py-32"
        aria-labelledby="values-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div
              className="w-16 h-0.5 rounded-full bg-accent mx-auto mb-6"
              aria-hidden="true"
            />
            <h2
              id="values-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground"
            >
              Nuestros Valores
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto text-base sm:text-lg">
              Los principios que guían cada decisión, cada track, cada artista.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {valueCards.map((card) => (
              <ValueCardComponent key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ───────────────────────────────────────────────────────── */}
      <section
        className="bg-surface py-20 lg:py-28"
        aria-labelledby="cta-heading"
      >
        {/* Borde superior sólido */}
        <div className="h-px bg-border mb-20" aria-hidden="true" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="cta-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-4"
          >
            ¿Quieres ser{" "}
            {/* Accent sólido — sin text-gradient */}
            <span className="text-accent">parte?</span>
          </h2>
          <p className="text-lg text-muted mb-10 max-w-xl mx-auto leading-relaxed">
            Tienes un sonido que merece ser escuchado. Nosotros tenemos el
            equipo para llevarlo al siguiente nivel.
          </p>

          <Button asChild variant="default" size="lg">
            <Link href="/contact" className="inline-flex items-center gap-2">
              Contáctanos
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
