"use client";

import { motion, useReducedMotion } from "motion/react";
import { HiArrowRight, HiDownload } from "react-icons/hi";

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-16">
      <div className="pointer-events-none fixed inset-0 z-[60]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(52,211,153,0.04),transparent_50%)]" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mb-6 inline-flex h-7 items-center rounded-full border border-accent/20 bg-accent-soft px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                Now in public beta
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter text-zinc-100 md:text-6xl lg:text-7xl"
            >
              Get paid while
              <br />
              <span className="text-accent">your AI thinks</span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md text-base leading-relaxed text-zinc-400"
            >
              Replace idle spinner time in Claude Code, ChatGPT, and Gemini with
              relevant sponsor ads. Earn up to 50% revenue share &mdash; just for
              doing your work.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <a
                href="#download"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                <HiDownload className="h-4 w-4" />
                Install extension
              </a>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                How it works
                <HiArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-1">
              <div className="h-full w-full rounded-xl border border-white/[0.04] bg-zinc-950 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="text-accent">&gt;</span>
                    <span>claude code --task "refactor auth"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-sm text-zinc-500">&gt;</span>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-48 rounded bg-zinc-800" />
                      <div className="h-3 w-36 rounded bg-zinc-800" />
                      <div className="h-3 w-52 rounded bg-zinc-800" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent-soft px-4 py-3">
                    <div className="h-8 w-8 flex-shrink-0 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                      AD
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-200">
                        Vercel &mdash; Deploy instantly
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        +$0.02 earned
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                    <span className="text-accent">&gt;</span>
                    <span className="animate-pulse text-accent">_</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
