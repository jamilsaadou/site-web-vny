"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: RevealProps) {
  const offset = 48;

  const initial =
    direction === "left"
      ? { opacity: 0, x: offset }
      : direction === "right"
        ? { opacity: 0, x: -offset }
        : { opacity: 0, y: offset };

  const animate =
    direction === "up"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
