"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HiDownload, HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Platforms", href: "#platforms" },
  { label: "Earnings", href: "#earnings" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] backdrop-blur-xl">
          <a href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-zinc-950">
              $
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              GetPaidToWait
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#download"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-zinc-950 transition-all hover:bg-accent/90 active:scale-[0.98]"
            >
              <HiDownload className="h-4 w-4" />
              Install
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-400 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.06] backdrop-blur-xl"
        >
          <div className="mx-auto max-w-[1400px] px-6 py-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#download"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-zinc-950"
              >
                <HiDownload className="h-4 w-4" />
                Install
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
