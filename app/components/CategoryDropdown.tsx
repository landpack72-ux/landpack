"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type MenuCategory = { slug: string; name: string; image_url: string | null };

// Bouton « Catégories » de la barre verte (ordinateur) : ouvre la liste des catégories.
export default function CategoryDropdown({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-md bg-water-dark px-4 py-2.5 font-body text-sm font-semibold text-cream transition-colors hover:bg-black/25"
      >
        <span aria-hidden className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 bg-cream" />
          <span className="block h-0.5 w-5 bg-cream" />
          <span className="block h-0.5 w-5 bg-cream" />
        </span>
        Catégories
        <span aria-hidden className="text-xs">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-md bg-water shadow-2xl">
          <ul>
            {categories.map((c) => (
              <li key={c.slug} className="border-b border-white/15 last:border-b-0">
                <Link
                  href={`/categorie/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 font-body text-sm font-medium text-cream transition-colors hover:bg-water-dark"
                >
                  <span aria-hidden className="text-cream/60">→</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
