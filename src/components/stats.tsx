"use client";

import { motion, useReducedMotion } from "motion/react";
import { HiTrendingUp, HiClock, HiCurrencyDollar, HiUsers } from "react-icons/hi";

const stats = [
  {
    icon: HiCurrencyDollar,
    value: "$0.02",
    label: "Avg. earned per wait",
    sub: "Based on current CPM rates",
  },
  {
    icon: HiClock,
    value: "1.2M+",
    label: "Minutes of wait time daily",
    sub: "Across our user base",
  },
  {
    icon: HiTrendingUp,
    value: "50%",
    label: "Revenue share to you",
    sub: "Highest in the market",
  },
  {
    icon: HiUsers,
    value: "12k+",
    label: "Active earners",
    sub: "And growing daily",
  },
];

export default function Stats() {
  const reduce = useReducedMotion();

  return (
    <section id="earnings" className="border-t border-white/[0.06] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Earn while you build
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Every millisecond your AI spends thinking is a micro-earning
            opportunity. The numbers add up fast.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col bg-surface p-8"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-semibold tracking-tight text-zinc-100">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm font-medium text-zinc-300">
                  {stat.label}
                </span>
                <span className="mt-1 text-xs text-zinc-500">{stat.sub}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
