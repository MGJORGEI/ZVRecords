"use client";

import { useInView } from "react-intersection-observer";

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
}

export function useScrollAnimation({
  threshold = 0.1,
  triggerOnce = true,
  delay = 0,
}: UseScrollAnimationOptions = {}) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  const variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      },
    },
  };

  return { ref, inView, variants };
}
