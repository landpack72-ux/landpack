"use client";

import { useEffect, useState } from "react";
import LandpackLogo from "./LandpackLogo";
import SearchBar from "./SearchBar";

export default function HeaderClient({
  links,
  ctaLabel,
}: {
  links: { href: string; label: string }[];
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md shadow-[0_2px_0_0_rgba(42,31,22,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 lg:px-10">
        <a href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LandpackLogo size={34} />
          <span className="font-display text-xl font-bold inline-block sm:text-2xl">
            <span className="text-nature">Land</span>
            <span className="text-gold">pack</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-water"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Recherche : cadre toujours visible, centrée sur mobile */}
        <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
          <SearchBar />
        </div>

        <div className="hidden lg:block">
          <a
            href="/#devis"
            className="whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-water"
          >
            {ctaLabel}
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu"
          className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-ink sm:h-10 sm:w-10 lg:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-dashed border-ink/20 bg-cream px-4 sm:px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-ink-soft"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/#devis"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-cream"
            >
              {ctaLabel}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
