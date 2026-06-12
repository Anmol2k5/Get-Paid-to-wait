"use client";

import { motion, useReducedMotion } from "motion/react";
import { HiDownload, HiArrowRight } from "react-icons/hi";

export default function Cta() {
  const reduce = useReducedMotion();

  return (
    <section
      id="download"
      className="border-t border-white/[0.06] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-zinc-950 px-8 py-16 text-center md:px-16 md:py-24"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.06),transparent_60%)]" />

          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Start earning from your next
              <br />
              <span className="text-accent">thinking cycle</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400">
              Free to install. No data collection. No impact on your AI response
              time. Just passive income.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://marketplace.visualstudio.com/items?itemName=Kickbacksai.kickbacks-ai"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                <HiDownload className="h-4 w-4" />
                Install for VS Code
              </a>
              <a
                href="#"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                Chrome extension
                <HiArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              No credit card required &middot; Uninstall anytime &middot; Weekly
              payouts
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
