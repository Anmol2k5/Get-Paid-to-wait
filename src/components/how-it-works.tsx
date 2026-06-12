"use client";

import { motion, useReducedMotion } from "motion/react";
import { HiDownload, HiCode, HiCash, HiEye } from "react-icons/hi";

const steps = [
  {
    icon: HiDownload,
    title: "Install the extension",
    description:
      "Add GetPaidToWait to VS Code, Chrome, or your AI coding assistant. Zero configuration.",
  },
  {
    icon: HiCode,
    title: "Work as usual",
    description:
      "Use Claude Code, ChatGPT, Gemini, or any supported AI tool. We detect idle spinner time automatically.",
  },
  {
    icon: HiEye,
    title: "Ads appear during waits",
    description:
      "Relevant sponsor ads replace blank loading spinners. Non-intrusive, context-aware, skippable.",
  },
  {
    icon: HiCash,
    title: "Earn revenue share",
    description:
      "Up to 50% of ad revenue goes to you. Paid out weekly. The more you use AI, the more you earn.",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how-it-works" className="border-t border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Your idle time, monetized
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Four simple steps to turn waiting into earning &mdash; without changing
            your workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative rounded-xl border border-white/[0.06] bg-surface p-6 transition-colors hover:border-white/[0.1]"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mb-2 text-[11px] font-mono text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
