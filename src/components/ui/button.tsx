"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// CVA: variantes tipadas usando solo los tokens del design system.
// Ninguna clase aquí usa gradientes, bg-gradient-*, from-*, to-*, ni colores arbitrarios.
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-semibold tracking-wide",
    "rounded-lg",
    "transition-all duration-200 ease-out",
    "cursor-pointer select-none",
    "disabled:pointer-events-none disabled:opacity-40",
    // Focus ring usa el token accent definido en el tema
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // Primary: fondo accent sólido, texto background (oscuro), hover ligeramente más oscuro
        default: [
          "bg-accent",
          "text-background",
          "border border-transparent",
          "hover:bg-accent/85",
        ],
        // Outline: borde sutil → borde accent + texto accent en hover
        outline: [
          "bg-transparent",
          "text-foreground",
          "border border-border",
          "hover:border-accent",
          "hover:text-accent",
        ],
        // Ghost: solo texto, bg sutil en hover. Sin bordes por defecto.
        ghost: [
          "bg-transparent",
          "text-muted",
          "border border-transparent",
          "hover:text-foreground",
          "hover:bg-surface-2",
        ],
      },
      size: {
        // sm: h-9 = 36px — mínimo viable con padding suficiente
        sm: "h-9 px-4 text-xs rounded-md",
        // md: h-11 = 44px — touch target recomendado en mobile
        md: "h-11 px-5 text-sm",
        // lg: h-12 = 48px — CTA principal, fácil de pulsar
        lg: "h-12 px-8 text-sm tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // asChild: pasa los estilos al hijo directo (ej. Next.js <Link>)
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Slot de Radix: si asChild=true, el hijo recibe todas las props y ref
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
