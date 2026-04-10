"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

// Container: stagger — los hijos animan en cascada sin delays manuales
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Cada hijo: fade-up con blur suave
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

// La línea crece horizontalmente desde su origen (left o center según align)
const lineVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut" as const,
    },
  },
};

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  // triggerOnce=true: anima solo la primera vez que entra al viewport
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
    // Espera 40px dentro del viewport antes de disparar
    rootMargin: "0px 0px -40px 0px",
  });

  const isCenter = align === "center";

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn(
        "flex flex-col gap-3",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {/* Línea decorativa: 40px ancho, 2px alto, color sólido accent — sin gradiente */}
      <motion.div
        variants={lineVariants}
        className="w-10 h-0.5 rounded-full bg-accent"
        style={{
          // transformOrigin define desde dónde crece con scaleX
          transformOrigin: isCenter ? "center" : "left",
        }}
        aria-hidden="true"
      />

      {/* Título: color foreground sólido. Sin text-gradient ni ningún truquito. */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground"
      >
        {title}
      </motion.h2>

      {/* Subtitle: solo monta el nodo si viene el prop, para no dejar hueco */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={cn(
            "text-base sm:text-lg text-muted leading-relaxed",
            isCenter ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
