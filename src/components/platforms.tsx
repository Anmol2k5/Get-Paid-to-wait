"use client";

import { motion, useReducedMotion } from "motion/react";
import { HiCode, HiGlobe, HiTerminal } from "react-icons/hi";

const platforms = [
  {
    name: "VS Code",
    icon: HiCode,
    description: "Claude Code & Codex extensions",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    name: "Browser",
    icon: HiGlobe,
    description: "ChatGPT, Claude.ai, Gemini",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    name: "Terminal",
    icon: HiTerminal,
    description: "Claude Code CLI",
    color: "text-zinc-300",
    bg: "bg-white/[0.06]",
  },
];

export default function Platforms() {
  const reduce = useReducedMotion();

  return (
    <section id="platforms" className="border-t border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Works everywhere you code
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Drop-in support for the most popular AI coding tools. One install covers
            all your surfaces.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {platforms.map((platform, i) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.name}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-surface p-8 text-center"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${platform.bg} ${platform.color}`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">
                  {platform.name}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{platform.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
