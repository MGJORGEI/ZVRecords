"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Youtube,
  Music2,
  CheckCircle2,
} from "lucide-react";
import { artists } from "@/data/artists";
import { cn } from "@/lib/cn";
import type { ContactFormData } from "@/types";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

type SubjectType = ContactFormData["type"];

interface SubjectOption {
  value: SubjectType;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS: SubjectOption[] = [
  { value: "general", label: "Consulta general" },
  { value: "booking", label: "Booking / Shows" },
  { value: "press", label: "Prensa / Media" },
  { value: "demo", label: "Enviar demo" },
];

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  type: "general",
  artistSlug: "",
};

// ─── Shared input class ───────────────────────────────────────────────────────

/**
 * py-3.5 garantiza área de toque >44px en mobile.
 * text-base evita zoom automático en iOS (fuentes <16px lo disparan).
 * outline-none + focus:border-accent: el borde de color es el único indicador de focus visible.
 */
const INPUT_CLASS =
  "w-full bg-surface-2 border border-border rounded-lg px-4 py-3.5 text-foreground text-base placeholder:text-muted/50 focus:border-accent outline-none transition-colors duration-200";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

function InfoCard({ icon, label, value, href }: InfoCardProps) {
  const content = (
    <div className="flex items-center gap-4">
      {/* Ícono con bg sólido — sin glow */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );

  const baseClass =
    "block bg-surface-2 border border-border rounded-xl p-4 transition-colors duration-200";

  if (href) {
    return (
      <a
        href={href}
        aria-label={`${label}: ${value}`}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={cn(baseClass, "hover:border-accent/50")}
      >
        {content}
      </a>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

interface SocialButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SocialButton({ href, icon, label }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-11 h-11 rounded-xl",
        "border border-border text-muted",
        "transition-colors duration-200",
        "hover:border-accent hover:text-accent",
        "focus-visible:ring-2 focus-visible:ring-accent outline-none",
      )}
    >
      {icon}
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ContactSection() {
  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs para las animaciones GSAP
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formColRef = useRef<HTMLDivElement>(null);
  const infoColRef = useRef<HTMLDivElement>(null);
  // Ref al form en sí (para stagger de filas de inputs)
  const formRef = useRef<HTMLFormElement>(null);
  // Ref al estado de éxito
  const successRef = useRef<HTMLDivElement>(null);

  // ── GSAP setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      // Timeline principal — se dispara cuando la sección entra al viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      // 1. Heading: fade + slide desde abajo — gsap.from() para progressive enhancement
      tl.from(
        headingRef.current,
        { opacity: 0, y: 32, duration: 0.65 },
      );

      // 2. Form column: slide desde izquierda
      tl.from(
        formColRef.current,
        { opacity: 0, x: -40, duration: 0.7 },
        "-=0.35",
      );

      // 3. Filas de inputs: stagger individual (0.1s entre cada grupo de campos)
      // Selecciona cada wrapper de campo dentro del form
      const fieldRows = section.querySelectorAll(".form-field-row");
      if (fieldRows.length > 0) {
        tl.from(
          fieldRows,
          {
            opacity: 0,
            y: 16,
            duration: 0.4,
            stagger: 0.1,
          },
          "-=0.45",
        );
      }

      // 4. Info column: slide desde derecha
      tl.from(
        infoColRef.current,
        { opacity: 0, x: 40, duration: 0.7 },
        // Empieza al mismo tiempo que el form column para que sea simultáneo
        "<0.1",
      );

      // 5. Info cards con stagger desde la derecha
      const infoCards = section.querySelectorAll(".info-card-item");
      if (infoCards.length > 0) {
        tl.from(
          infoCards,
          {
            opacity: 0,
            x: 28,
            duration: 0.45,
            stagger: 0.1,
          },
          "-=0.5",
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Form handlers ───────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // Aquí conectarías tu Server Action o API route
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitted(true);

    // Pequeña animación de entrada al estado de éxito con GSAP
    // Se dispara después del state update (siguiente tick)
    // gsap.from() — el elemento ya es visible por defecto, GSAP anima desde oculto
    requestAnimationFrame(() => {
      if (successRef.current) {
        gsap.from(
          successRef.current,
          { opacity: 0, scale: 0.94, y: 16, duration: 0.45, ease: "back.out(1.5)" },
        );
      }
    });
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setSubmitted(false);
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 lg:py-32 bg-background"
      aria-label="Sección de contacto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading — anima como bloque */}
        <div
          ref={headingRef}
          className="mb-12 lg:mb-14 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-3">
            Contacto
          </h2>
          <p className="text-muted text-base max-w-xl mx-auto">
            ¿Listo para hacer historia? Escríbenos
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left column: Form ── */}
          <div
            ref={formColRef}
          >
            {/* Contenedor del form — fondo sólido, sin glow alrededor */}
            <div className="bg-surface border border-border rounded-xl p-5 sm:p-8">
              {submitted ? (
                /* ── Success state ── */
                <div
                  ref={successRef}
                  className="flex flex-col items-center justify-center gap-5 py-16 text-center"
                >
                  <CheckCircle2
                    className="w-14 h-14 text-accent"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-muted text-sm max-w-xs">
                      Recibimos tu mensaje. Nuestro equipo se pondrá en
                      contacto contigo en menos de 48 horas.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-accent font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-accent outline-none rounded mt-2"
                    aria-label="Enviar otro mensaje"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                /* ── Form state ── */
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                  aria-label="Formulario de contacto"
                >
                  {/* Row 1: Name + Email */}
                  {/*
                   * .form-field-row: selector que GSAP usa para el stagger de filas.
                   * Cada "fila" es un wrapper de uno o más campos.
                   */}
                  <div className="form-field-row grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-name"
                        className="text-xs text-muted uppercase tracking-widest"
                      >
                        Nombre *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                        autoComplete="name"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-email"
                        className="text-xs text-muted uppercase tracking-widest"
                      >
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        required
                        autoComplete="email"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone */}
                  <div className="form-field-row flex flex-col gap-1.5" >
                    <label
                      htmlFor="contact-phone"
                      className="text-xs text-muted uppercase tracking-widest"
                    >
                      Teléfono
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+52 55 0000 0000"
                      autoComplete="tel"
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* Row 3: Subject type + Artist */}
                  <div className="form-field-row grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-type"
                        className="text-xs text-muted uppercase tracking-widest"
                      >
                        Asunto *
                      </label>
                      <select
                        id="contact-type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className={cn(INPUT_CLASS, "cursor-pointer [&>option]:bg-surface-2")}
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-artist"
                        className="text-xs text-muted uppercase tracking-widest"
                      >
                        Artista{" "}
                        <span className="normal-case tracking-normal text-muted/60">
                          (opcional)
                        </span>
                      </label>
                      <select
                        id="contact-artist"
                        name="artistSlug"
                        value={form.artistSlug}
                        onChange={handleChange}
                        className={cn(INPUT_CLASS, "cursor-pointer [&>option]:bg-surface-2")}
                      >
                        <option value="">— Sin artista específico —</option>
                        {artists.map((artist) => (
                          <option key={artist.id} value={artist.slug}>
                            {artist.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Subject text */}
                  <div className="form-field-row flex flex-col gap-1.5" >
                    <label
                      htmlFor="contact-subject"
                      className="text-xs text-muted uppercase tracking-widest"
                    >
                      Tema *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="¿De qué se trata?"
                      required
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* Row 5: Message */}
                  <div className="form-field-row flex flex-col gap-1.5" >
                    <label
                      htmlFor="contact-message"
                      className="text-xs text-muted uppercase tracking-widest"
                    >
                      Mensaje *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos sobre tu proyecto, propuesta o consulta..."
                      required
                      rows={5}
                      className={cn(INPUT_CLASS, "resize-none leading-relaxed")}
                    />
                  </div>

                  {/* Row 6: Submit — bg sólido, sin bg-gradient */}
                  <div className="form-field-row" >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "flex items-center justify-center gap-3 w-full h-12 rounded-lg",
                        "bg-accent text-background font-bold",
                        "transition-colors duration-200",
                        "hover:bg-accent-dim",
                        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" aria-hidden="true" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── Right column: Info + Social + Quote ── */}
          <div
            ref={infoColRef}
            className="flex flex-col gap-8"
                     >

            {/* Info cards */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted uppercase tracking-widest mb-1">
                Encuéntranos
              </p>
              {[
                {
                  icon: <Mail className="w-4 h-4" aria-hidden="true" />,
                  label: "Email general",
                  value: "contacto@zvrecords.com",
                  href: "mailto:contacto@zvrecords.com",
                },
                {
                  icon: <Mail className="w-4 h-4" aria-hidden="true" />,
                  label: "Booking",
                  value: "booking@zvrecords.com",
                  href: "mailto:booking@zvrecords.com",
                },
                {
                  icon: <Phone className="w-4 h-4" aria-hidden="true" />,
                  label: "Teléfono",
                  value: "+52 55 1234 5678",
                  href: "tel:+525512345678",
                },
                {
                  icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
                  label: "Ubicación",
                  value: "Ciudad de México, México",
                  href: undefined,
                },
              ].map(({ icon, label, value, href }) => (
                /*
                 * .info-card-item: selector para el stagger de GSAP en la columna derecha.
                 * El stagger aplica desde la derecha (x: 28 → x: 0).
                 */
                <div key={label} className="info-card-item" >
                  <InfoCard icon={icon} label={label} value={value} href={href} />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div aria-hidden="true" className="h-px bg-border" />

            {/* Social links — botones con borde sólido */}
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-3">
                Síguenos
              </p>
              <div className="flex items-center gap-3">
                <SocialButton
                  href="https://instagram.com"
                  icon={<Instagram className="w-5 h-5" aria-hidden="true" />}
                  label="Instagram de ZV Records"
                />
                <SocialButton
                  href="https://youtube.com"
                  icon={<Youtube className="w-5 h-5" aria-hidden="true" />}
                  label="YouTube de ZV Records"
                />
                <SocialButton
                  href="https://open.spotify.com"
                  icon={<Music2 className="w-5 h-5" aria-hidden="true" />}
                  label="Spotify de ZV Records"
                />
              </div>
            </div>

            {/* Divider */}
            <div aria-hidden="true" className="h-px bg-border" />

            {/* Blockquote — borde izquierdo sólido, sin bg-gradient */}
            <blockquote className="border-l-2 border-accent pl-5">
              <p className="text-foreground italic text-base leading-relaxed">
                "En ZV Records no firmamos artistas, construimos carreras. Cada
                proyecto es personal y cada historia merece ser contada."
              </p>
              <cite className="block mt-3 text-muted text-xs not-italic font-semibold uppercase tracking-widest">
                — Equipo ZV Records
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
