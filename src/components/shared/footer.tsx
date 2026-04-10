// Server Component — sin "use client". No hay estado ni hooks.
// Data hardcodeada como constantes, fácil de migrar a fetch después.

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Music2, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_LINKS: FooterLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Artistas", href: "/artists" },
  { label: "Videos", href: "/#videos" },
  { label: "Lanzamientos", href: "/#releases" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

const GENRE_LINKS: FooterLink[] = [
  { label: "Reggaetón", href: "/#releases" },
  { label: "Trap Latino", href: "/#releases" },
  { label: "Pop Latino", href: "/#releases" },
  { label: "R&B", href: "/#releases" },
  { label: "Urbano", href: "/#releases" },
  { label: "Electrónica", href: "/#releases" },
];

const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "Music", href: "#", icon: Music2 },
  { label: "Twitter / X", href: "https://twitter.com", icon: Twitter },
];

export function Footer() {
  return (
    <footer
      className="bg-surface border-t border-border mt-auto"
      role="contentinfo"
      aria-label="Pie de página ZV Records"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Grid principal: 1 col mobile → 2 tablet → 4 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Columna 1: Logo + descripción + redes sociales */}
          <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3 group w-fit"
              aria-label="ZV Records - Ir al inicio"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border group-hover:border-accent transition-colors duration-200">
                <Image
                  src="/logo.jpeg"
                  alt="ZV Records logo"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              {/* Texto sólido — usa token foreground, sin gradiente */}
              <span className="text-sm font-bold tracking-[0.15em] text-foreground">
                ZV RECORDS
              </span>
            </Link>

            <p className="text-sm text-muted leading-relaxed max-w-xs">
              La discográfica que está redefiniendo la escena musical latina.
              Talento sin límites, sonido sin fronteras.
            </p>

            {/* Redes sociales — w-11 h-11 = 44px touch target mínimo */}
            <div
              className="flex items-center gap-3"
              role="list"
              aria-label="Redes sociales"
            >
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Seguir en ${social.label}`}
                    role="listitem"
                    className={cn(
                      // 44px mínimo recomendado para touch targets
                      "flex items-center justify-center w-11 h-11 rounded-lg",
                      "text-muted hover:text-accent",
                      "border border-border hover:border-accent",
                      "bg-surface-2",
                      "transition-colors duration-200",
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground">
              Navegación
            </h3>
            <ul className="flex flex-col gap-1" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {/* min-h-[44px] garantiza touch target cómodo en mobile */}
                  <Link
                    href={link.href}
                    className={cn(
                      "min-h-[44px] flex items-center",
                      "text-sm text-muted hover:text-foreground",
                      "transition-colors duration-200",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Géneros */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground">
              Géneros
            </h3>
            <ul className="flex flex-col gap-1" role="list">
              {GENRE_LINKS.map((genre) => (
                <li key={genre.label}>
                  {/* min-h-[44px] para touch target en mobile */}
                  <Link
                    href={genre.href}
                    className={cn(
                      "min-h-[44px] flex items-center",
                      "text-sm text-muted hover:text-foreground",
                      "transition-colors duration-200",
                    )}
                  >
                    {genre.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground">
              Contacto
            </h3>
            <ul className="flex flex-col gap-2" role="list">

              <li>
                {/* min-h-[44px] para touch target */}
                <a
                  href="mailto:contacto@zvrecords.com"
                  className={cn(
                    "flex items-center gap-3 min-h-[44px]",
                    "text-sm text-muted hover:text-foreground",
                    "transition-colors duration-200 group",
                  )}
                  aria-label="Enviar email a contacto@zvrecords.com"
                >
                  {/* Ícono en cuadro con borde border-border, hover border-accent */}
                  <span
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-md flex-shrink-0",
                      "bg-surface-2 border border-border",
                      "group-hover:border-accent group-hover:text-accent",
                      "text-muted transition-colors duration-200",
                    )}
                    aria-hidden="true"
                  >
                    <Mail size={14} />
                  </span>
                  contacto@zvrecords.com
                </a>
              </li>

              <li>
                <a
                  href="tel:+521234567890"
                  className={cn(
                    "flex items-center gap-3 min-h-[44px]",
                    "text-sm text-muted hover:text-foreground",
                    "transition-colors duration-200 group",
                  )}
                  aria-label="Llamar al +52 123 456 7890"
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-md flex-shrink-0",
                      "bg-surface-2 border border-border",
                      "group-hover:border-accent group-hover:text-accent",
                      "text-muted transition-colors duration-200",
                    )}
                    aria-hidden="true"
                  >
                    <Phone size={14} />
                  </span>
                  +52 123 456 7890
                </a>
              </li>

              <li>
                <div
                  className={cn(
                    "flex items-center gap-3 min-h-[44px]",
                    "text-sm text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-md flex-shrink-0",
                      "bg-surface-2 border border-border",
                      "text-muted",
                    )}
                    aria-hidden="true"
                  >
                    <MapPin size={14} />
                  </span>
                  Ciudad de México, México
                </div>
              </li>

            </ul>
          </div>

        </div>

        {/* Separador y barra de copyright — border sólido, sin gradiente */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted text-center sm:text-left">
              © 2026 ZV Records. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted text-center sm:text-right">
              Hecho con{" "}
              <span className="text-accent" aria-label="amor">
                ♥
              </span>{" "}
              en México
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
