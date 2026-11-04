"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export type SearchEntry = { id: string; name: string; dimensions: string | null; category: string; slug: string };

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Recherche dans le catalogue : catégories, modèles et dimensions (« 30 », « pizza », « sachet 20 »…).
export default function HeaderSearch({ entries, tone = "light" }: { entries: SearchEntry[]; tone?: "light" | "bar" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const terms = norm(q).split(/\s+/).filter(Boolean);
  const hits = terms.length
    ? entries.filter((e) => terms.every((t) => norm(`${e.category} ${e.name} ${e.dimensions ?? ""}`).includes(t))).slice(0, 8)
    : [];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (hits[0]) window.location.assign(`/produit/${hits[0].id}`);
  }

  return (
    <div ref={box} className="relative w-full">
      <form role="search" onSubmit={submit} className="flex">
        <label htmlFor="site-search" className="sr-only">Rechercher un modèle</label>
        <input
          id="site-search"
          type="search"
          value={q}
          autoComplete="off"
          placeholder="Rechercher un article, une dimension…"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className={`h-11 w-full min-w-0 rounded-l-md bg-white px-4 font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none ${tone === "bar" ? "border-0" : "border border-r-0 border-ink/25 focus:border-water"}`}
        />
        <button
          type="submit"
          aria-label="Rechercher"
          className={`flex h-11 shrink-0 items-center justify-center rounded-r-md px-4 font-body text-sm font-semibold transition-colors sm:px-6 ${tone === "bar" ? "bg-kraft text-ink hover:bg-kraft-dark" : "bg-water text-cream hover:bg-water-dark"}`}
        >
          <span className="hidden sm:inline">Rechercher</span>
          <svg className="h-5 w-5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      {open && terms.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-ink/15 bg-white shadow-xl">
          {hits.length === 0 ? (
            <p className="px-4 py-3 font-body text-sm text-ink-soft">Aucun résultat pour « {q} ».</p>
          ) : (
            <ul>
              {hits.map((h) => (
                <li key={h.id} className="border-b border-ink/10 last:border-b-0">
                  <a
                    href={`/produit/${h.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-3 px-4 py-2.5 font-body text-sm text-ink hover:bg-paper"
                  >
                    <span className="min-w-0 truncate font-semibold">
                      {h.category} — {h.name}
                    </span>
                    {h.dimensions && <span className="shrink-0 text-xs text-ink-soft">{h.dimensions}</span>}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
