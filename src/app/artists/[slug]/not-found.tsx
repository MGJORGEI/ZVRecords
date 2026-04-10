import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Artista no encontrado | ZV Records",
  description: "El artista que buscas no existe en el roster de ZV Records.",
};

export default function ArtistNotFound() {
  return (
    <main
      className="min-h-screen bg-background flex items-center justify-center px-4"
      aria-labelledby="not-found-title"
    >
      {/* Contenido centrado */}
      <div className="flex flex-col items-center text-center gap-6 max-w-lg">

        {/* Número 404 decorativo — sólido, sin text-gradient */}
        <div
          className={cn(
            "text-[10rem] sm:text-[12rem] font-black leading-none",
            "select-none pointer-events-none",
            "text-foreground opacity-[0.06]",
          )}
          aria-hidden="true"
        >
          404
        </div>

        {/* Ícono */}
        <div
          className={cn(
            "-mt-16 sm:-mt-20",
            "flex items-center justify-center w-16 h-16 rounded-2xl",
            "bg-surface-2 border border-border",
          )}
          aria-hidden="true"
        >
          <Search size={28} className="text-accent" />
        </div>

        {/* Título y descripción */}
        <div className="flex flex-col gap-3">
          <h1
            id="not-found-title"
            className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight"
          >
            Artista no encontrado
          </h1>
          <p className="text-muted text-base leading-relaxed">
            El artista que buscas no está en nuestro roster. Es posible que el
            enlace sea incorrecto o que el artista haya salido del sello.
          </p>
        </div>

        {/* Separador sólido */}
        <div
          className="w-16 h-[2px] rounded-full bg-accent"
          aria-hidden="true"
        />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button asChild variant="default" size="lg">
            <Link href="/artists">
              <ArrowLeft size={16} />
              Ver todos los artistas
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/">
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
