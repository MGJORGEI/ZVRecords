"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Youtube,
  Music,
  CheckCircle2,
  X,
} from "lucide-react";
import { artists } from "@/data/artists";
import { cn } from "@/lib/cn";
import type { ContactFormData } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubjectType = ContactFormData["type"];

interface SubjectOption {
  value: SubjectType;
  label: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS: SubjectOption[] = [
  { value: "booking", label: "Booking", description: "Fechas, shows, giras" },
  { value: "press", label: "Prensa", description: "Entrevistas, medios" },
  { value: "demo", label: "Demo Submission", description: "Envía tu música" },
  { value: "general", label: "General", description: "Cualquier otra consulta" },
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

// ─── Input class helper ───────────────────────────────────────────────────────
// Usa colores sólidos del tema — sin neon-*, sin dark-*

function inputClass(hasError = false): string {
  return cn(
    "w-full bg-surface-2 border rounded-xl px-4 py-3 text-sm text-foreground",
    "placeholder:text-muted outline-none",
    "transition-all duration-200",
    "focus:border-accent/60 focus:bg-surface-3",
    hasError ? "border-red-500/60" : "border-border",
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

// ─── Info Row ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

function InfoRow({ icon, label, value, href }: InfoRowProps) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-surface-2 border border-border",
        "transition-all duration-300",
        "group hover:border-accent/50",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg",
          "bg-surface-3 flex items-center justify-center text-accent",
          "transition-colors duration-300",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm text-foreground/70 font-medium group-hover:text-accent transition-colors duration-300 truncate">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} aria-label={`${label}: ${value}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
        {inner}
      </a>
    );
  }
  return inner;
}

// ─── Contact Form — necesita su propio componente por useSearchParams ─────────

function ContactForm() {
  const searchParams = useSearchParams();
  const artistParam = searchParams.get("artist") ?? "";

  const [form, setForm] = useState<ContactFormData>({
    ...INITIAL_FORM,
    artistSlug: artistParam,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar si el param cambia client-side
  useEffect(() => {
    if (artistParam) {
      setForm((prev) => ({ ...prev, artistSlug: artistParam }));
    }
  }, [artistParam]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulación — aquí conectas tu Server Action o API route
    await new Promise<void>((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  function handleReset() {
    setForm({ ...INITIAL_FORM, artistSlug: "" });
    setSubmitted(false);
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 sm:p-8 overflow-hidden",
        "bg-surface-2 border border-border",
      )}
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-6 py-20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "bg-surface-3 border border-border",
              )}
            >
              <CheckCircle2 className="w-10 h-10 text-accent" aria-hidden="true" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">¡Mensaje enviado!</h3>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                Recibimos tu mensaje. Nuestro equipo se pondrá en contacto contigo a la brevedad.
              </p>
            </div>
            <button
              onClick={handleReset}
              className={cn(
                "flex items-center gap-2 text-xs text-muted hover:text-accent",
                "transition-colors duration-200 mt-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1",
              )}
              aria-label="Enviar otro mensaje"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          /* ── Form state ── */
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
            aria-label="Formulario de contacto"
          >
            {/* Row 1: Nombre + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cpage-name"
                  className="text-xs text-muted uppercase tracking-widest"
                >
                  Nombre{" "}
                  <span className="text-accent" aria-hidden="true">*</span>
                </label>
                <input
                  id="cpage-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                  autoComplete="name"
                  className={inputClass()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cpage-email"
                  className="text-xs text-muted uppercase tracking-widest"
                >
                  Email{" "}
                  <span className="text-accent" aria-hidden="true">*</span>
                </label>
                <input
                  id="cpage-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  className={inputClass()}
                />
              </div>
            </div>

            {/* Row 2: Teléfono + Tipo de consulta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cpage-phone"
                  className="text-xs text-muted uppercase tracking-widest"
                >
                  Teléfono
                </label>
                <input
                  id="cpage-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+52 55 0000 0000"
                  autoComplete="tel"
                  className={inputClass()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cpage-type"
                  className="text-xs text-muted uppercase tracking-widest"
                >
                  Tipo de consulta{" "}
                  <span className="text-accent" aria-hidden="true">*</span>
                </label>
                <select
                  id="cpage-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className={cn(inputClass(), "cursor-pointer [&>option]:bg-surface-2")}
                >
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Selector de artista — pre-seleccionado por ?artist= param */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cpage-artist"
                className="text-xs text-muted uppercase tracking-widest"
              >
                Artista{" "}
                <span className="text-muted/50 normal-case tracking-normal ml-1 text-xs">
                  (opcional)
                </span>
              </label>
              <select
                id="cpage-artist"
                name="artistSlug"
                value={form.artistSlug}
                onChange={handleChange}
                className={cn(inputClass(), "cursor-pointer [&>option]:bg-surface-2")}
              >
                <option value="">— Sin artista específico —</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.slug}>
                    {artist.name} · {artist.genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 4: Asunto */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cpage-subject"
                className="text-xs text-muted uppercase tracking-widest"
              >
                Asunto
              </label>
              <input
                id="cpage-subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Resumen breve de tu mensaje"
                className={inputClass()}
              />
            </div>

            {/* Row 5: Mensaje */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cpage-message"
                className="text-xs text-muted uppercase tracking-widest"
              >
                Mensaje{" "}
                <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <textarea
                id="cpage-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Cuéntanos sobre tu proyecto, propuesta o consulta..."
                required
                rows={6}
                className={cn(inputClass(), "resize-none leading-relaxed")}
              />
            </div>

            {/* Submit — bg-accent sólido, sin gradiente */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "relative flex items-center justify-center gap-3 w-full py-4 rounded-xl mt-1",
                "text-sm font-bold tracking-widest uppercase",
                "bg-accent text-background",
                "transition-all duration-300",
                "hover:bg-accent-dim",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 outline-none",
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
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background" aria-label="Página de Contacto">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section
        className="bg-surface py-20"
        aria-labelledby="contact-hero-heading"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center"
        >
          {/* Tag — sólido, sin blur ni orbs */}
          <motion.div
            variants={fadeInUp}
            custom={0}
            className={cn(
              "inline-flex items-center gap-2 rounded-full mb-8",
              "border border-border bg-surface-2 px-4 py-1.5",
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
              aria-hidden="true"
            />
            <span className="text-xs text-muted uppercase tracking-widest font-semibold">
              Estamos para escucharte
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="contact-hero-heading"
            variants={fadeInUp}
            custom={0.1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight text-foreground mb-6"
          >
            Contacto
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            custom={0.2}
            className="text-lg sm:text-xl text-muted max-w-xl mx-auto leading-relaxed"
          >
            Tienes una idea, un proyecto, o simplemente quieres hablar de música.
            Escríbenos — respondemos siempre.
          </motion.p>
        </motion.div>

        {/* Borde inferior */}
        <div className="h-px bg-border mt-8" aria-hidden="true" />
      </section>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <section
        className="relative py-12 lg:py-20"
        aria-labelledby="contact-form-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

            {/* ── Izquierda: Formulario ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
              custom={0}
            >
              <h2
                id="contact-form-heading"
                className="text-xl font-bold text-foreground mb-6 flex items-center gap-3"
              >
                {/* Separador sólido bg-accent */}
                <span
                  className="inline-block w-6 h-0.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
                Envíanos un mensaje
              </h2>

              {/* Suspense porque ContactForm usa useSearchParams */}
              <Suspense
                fallback={
                  <div
                    className={cn(
                      "rounded-2xl bg-surface-2 border border-border p-8",
                      "flex items-center justify-center min-h-[400px]",
                    )}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-border border-t-accent animate-spin" />
                      <span className="text-xs text-muted uppercase tracking-widest">Cargando</span>
                    </div>
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </motion.div>

            {/* ── Derecha: Info sidebar ── */}
            <motion.aside
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              custom={0.15}
              aria-label="Información de contacto"
              className="flex flex-col gap-8 lg:sticky lg:top-24"
            >
              {/* Datos de contacto */}
              <div>
                <h2 className="text-xs text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-accent" aria-hidden="true" />
                  Encuéntranos
                </h2>
                <div className="flex flex-col gap-3">
                  <InfoRow
                    icon={<Mail className="w-4 h-4" aria-hidden="true" />}
                    label="Email"
                    value="contacto@zvrecords.com"
                    href="mailto:contacto@zvrecords.com"
                  />
                  <InfoRow
                    icon={<Phone className="w-4 h-4" aria-hidden="true" />}
                    label="Teléfono"
                    value="+52 55 1234 5678"
                    href="tel:+525512345678"
                  />
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
                    label="Ubicación"
                    value="Ciudad de México, México"
                  />
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h2 className="text-xs text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-px bg-accent" aria-hidden="true" />
                  Síguenos
                </h2>
                <div className="flex items-center gap-3">
                  {[
                    {
                      href: "https://instagram.com",
                      label: "Instagram de ZV Records",
                      icon: <Instagram className="w-5 h-5" aria-hidden="true" />,
                    },
                    {
                      href: "https://youtube.com",
                      label: "YouTube de ZV Records",
                      icon: <Youtube className="w-5 h-5" aria-hidden="true" />,
                    },
                    {
                      href: "https://tiktok.com",
                      label: "TikTok de ZV Records",
                      icon: <Music className="w-5 h-5" aria-hidden="true" />,
                    },
                  ].map(({ href, label, icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn(
                        "flex items-center justify-center w-11 h-11 rounded-xl",
                        "border border-border bg-surface-2 text-muted",
                        "transition-all duration-200",
                        "hover:border-accent/50 hover:text-accent",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      )}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div
                className={cn(
                  "rounded-2xl p-6 relative overflow-hidden",
                  "bg-surface-2 border border-border",
                )}
              >
                <h3 className="text-xs text-muted uppercase tracking-widest mb-4">
                  Horario de atención
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { day: "Lunes — Viernes", hours: "10:00 — 19:00" },
                    { day: "Sábado", hours: "11:00 — 15:00" },
                    { day: "Domingo", hours: "Cerrado" },
                  ].map(({ day, hours }) => (
                    <div
                      key={day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted">{day}</span>
                      <span
                        className={cn(
                          "font-medium",
                          hours === "Cerrado"
                            ? "text-muted/40"
                            : "text-accent",
                        )}
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <blockquote
                className={cn(
                  "relative rounded-2xl p-6 overflow-hidden",
                  "bg-surface-2 border border-border",
                )}
              >
                {/* Comilla decorativa — opacidad muy baja, sólida */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-4 text-6xl leading-none font-black text-foreground/5 select-none"
                >
                  "
                </span>
                <p className="relative text-base font-bold text-foreground/70 leading-snug text-center mt-2">
                  La música es el lenguaje universal
                </p>
                <footer className="mt-3 text-center">
                  <cite className="not-italic text-xs text-accent uppercase tracking-widest font-semibold">
                    ZV Records
                  </cite>
                </footer>
              </blockquote>
            </motion.aside>
          </div>
        </div>
      </section>
    </main>
  );
}
