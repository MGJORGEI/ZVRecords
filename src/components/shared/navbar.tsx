"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Artistas", href: "/artists" },
  { label: "Videos", href: "/#videos" },
  { label: "Lanzamientos", href: "/#releases" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

// Menú mobile: slide-down con stagger en los items
const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

const mobileLinkVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -6, transition: { duration: 0.15 } },
};

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detecta scroll para mostrar borde inferior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra el menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Bloquea scroll del body cuando el menú mobile está abierto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Para links con hash (/#videos) solo compara el pathname base sin el #
  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    const basePath = href.split("#")[0];
    return basePath !== "" && pathname.startsWith(basePath);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300 ease-out",
        "bg-background/90 backdrop-blur-md",
        // Al hacer scroll: borde sólido sin gradiente
        isScrolled && "border-b border-border",
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group flex-shrink-0"
            aria-label="ZV Records - Ir al inicio"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border group-hover:border-accent transition-colors duration-200">
              <Image
                src="/logo.jpeg"
                alt="ZV Records logo"
                width={40}
                height={40}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-sm font-bold tracking-[0.15em] text-foreground">
              ZV RECORDS
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium tracking-wide",
                      "rounded-md transition-colors duration-200",
                      active
                        ? "text-accent"
                        : "text-muted hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                    {/* Underline: 2px sólido bg-accent. Crece/desaparece con width transition */}
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2",
                        "h-[2px] rounded-full bg-accent",
                        "transition-all duration-250 ease-out",
                        active ? "w-4/5 opacity-100" : "w-0 opacity-0",
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Hamburger — w-11 h-11 = 44px touch target mínimo */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={cn(
              "lg:hidden",
              "flex items-center justify-center w-11 h-11 rounded-lg",
              "text-muted hover:text-foreground",
              "border border-border hover:border-accent",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={20} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu — slide-down con AnimatePresence */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "lg:hidden",
              "border-t border-border",
              "bg-background",
            )}
            role="navigation"
            aria-label="Menú mobile"
          >
            <ul
              className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1"
              role="list"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <motion.li key={link.href} variants={mobileLinkVariants}>
                    <Link
                      href={link.href}
                      // min-h-[48px] garantiza touch target cómodo en mobile
                      className={cn(
                        "flex items-center px-4 min-h-[48px] rounded-lg",
                        "text-base font-medium tracking-wide",
                        "transition-colors duration-200",
                        active
                          ? "bg-surface-2 text-accent"
                          : "text-muted hover:text-foreground hover:bg-surface-2",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            {/* Separador sólido al fondo del menú */}
            <div
              className="h-px mx-4 mb-3 bg-border"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
