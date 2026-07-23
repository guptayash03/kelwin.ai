"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ParsingAnimationProps {
  providerName: string;
}

export function ParsingAnimation({ providerName }: ParsingAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <Sparkles className="h-8 w-8 text-primary" />
      </motion.div>

      <motion.p
        className="mt-6 text-sm font-medium text-foreground"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Analyzing your resume...
      </motion.p>
      <p className="mt-2 text-xs text-muted-foreground">
        Using {providerName} to extract your profile
      </p>

      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
