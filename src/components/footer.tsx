import { HiHeart } from "react-icons/hi";

const footerLinks = [
  {
    heading: "Product",
    links: ["VS Code Extension", "Chrome Extension", "CLI Tool", "Advertise"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-zinc-950">
                $
              </span>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                GetPaidToWait
              </span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Turn AI loading spinners into passive income. Built by{" "}
              <a
                href="https://kickbacks.ai"
                className="text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
              >
                ShiftKeys, Inc.
              </a>
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {group.heading}
              </h4>
              <ul className="mt-4 space-y-2">
                  {group.links.map((link) => {
                    const href = link === "Advertise" ? "/advertise" : "#";
                    return (
                      <li key={link}>
                        <a
                          href={href}
                          className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          {link}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} ShiftKeys, Inc. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-zinc-600">
            Made with <HiHeart className="h-3 w-3 text-red-400" /> for developers
            everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
