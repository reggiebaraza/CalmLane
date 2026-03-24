"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
