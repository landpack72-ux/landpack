"use client";

import { useEffect, useRef, useState } from "react";

const PAGES = [
  {
    title: "Personnalisation",
    href: "/personnalisation",
    desc: "Sacs kraft, boîtes et gobelets à votre logo",
    keywords: "personnalisation sacs kraft gobelets boites logo articles",
  },
  {
    title: "Sur mesure",
    href: "/sur-mesure",
    desc: "Formats et prototypes adaptés à votre produit",
    keywords: "sur mesure prototype format dimensions",
  },
  {
    title: "Solutions & Machines",
    href: "/solutions-machines",
    desc: "Scellage, banderolage, étiquetage",
    keywords: "solutions machines scellage banderolage etiquetage equipement",
  },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function useSearchResults(query: string) {
  const q = normalize(query.trim());
  if (!q) return PAGES;
  return PAGES.filter((p) => normalize(p.title + " " + p.keywords).includes(q));
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20 L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ResultsList({ results, onSelect }: { results: typeof PAGES; onSelect: () => void }) {
  if (results.length === 0) {
    return (
      <p className="px-4 py-3 font-body text-sm text-ink-soft">
        Aucune page trouvée.
      </p>
    );
  }
  return (
    <ul>
      {results.map((p) => (
        <li key={p.href}>
          <a
            href={p.href}
            onClick={onSelect}
            className="block px-4 py-2.5 transition-colors hover:bg-paper"
          >
            <p className="font-body text-sm font-medium text-ink">{p.title}</p>
            <p className="font-body text-xs text-ink-soft">{p.desc}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Barre de recherche avec cadre toujours visible, sur mobile comme
 * sur desktop. Largeur responsive : compacte sur petit écran, plus
 * large à partir de sm/lg. Le dropdown de résultats s'ouvre au focus.
 */
export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const results = useSearchResults(query);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[9.5rem] sm:max-w-[13rem] lg:max-w-[15rem]">
      <div
        className={`flex items-center gap-2 rounded-full border-2 bg-cream px-3 py-2 transition-colors sm:px-3.5 ${
          open ? "border-water" : "border-ink/15"
        }`}
      >
        <span className="text-ink-soft">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher..."
          className="w-full min-w-0 bg-transparent font-body text-xs text-ink placeholder:text-ink/40 focus:outline-none sm:text-sm"
        />
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[82vw] max-w-xs -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-ink/10 bg-cream shadow-[6px_6px_0_0_rgba(23,36,43,0.1)] sm:w-72">
          <ResultsList results={results} onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
