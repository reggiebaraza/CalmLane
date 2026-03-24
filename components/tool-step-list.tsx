"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ToolStepList({ steps }: { steps: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed md:text-[0.9375rem]">
      {steps.map((step, i) =>
        reduce ? (
          <li key={`${i}-${step.slice(0, 24)}`} className="pl-1">
            {step}
          </li>
        ) : (
          <motion.li
            key={`${i}-${step.slice(0, 24)}`}
            className="pl-1"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
          >
            {step}
          </motion.li>
        ),
      )}
    </ol>
  );
}
