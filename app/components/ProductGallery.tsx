"use client";

import { useRef, useState } from "react";
import Pic from "./Pic";

const SIZES = "(min-width: 1024px) 560px, 92vw";

// Photos d'un article : grande photo en haut, miniatures cliquables en dessous (comme sur les boutiques en ligne).
// Un clic sur une miniature affiche la photo en grand ; les flèches et le balayage du doigt font défiler.
export default function ProductGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const count = images.length;
  const [i, setI] = useState(0); // photo choisie
  const [shown, setShown] = useState(0); // photo affichée : la dernière chargée (évite un blanc pendant le chargement)
  const [mounted, setMounted] = useState<number[]>([0]); // photos déjà demandées (et leurs voisines) : on ne charge pas tout d'un coup
  const target = useRef(0);
  const loaded = useRef(new Set<number>([0]));
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(k: number) {
    if (k < 0 || k >= count) return;
    target.current = k;
    setI(k);
    setMounted((m) => [...new Set([...m, k, k - 1, k + 1])].filter((x) => x >= 0 && x < count));
    if (loaded.current.has(k)) setShown(k);
    requestAnimationFrame(() => thumbs.current[k]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }));
  }

  function onLoad(k: number) {
    loaded.current.add(k);
    if (k === target.current) setShown(k);
  }

  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-white/90 text-lg font-semibold text-ink shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water disabled:hidden";

  return (
    <div className="lg:sticky lg:top-6">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-md border border-ink/10 bg-white sm:aspect-square"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start == null || count < 2) return;
          const dx = (e.changedTouches[0]?.clientX ?? start) - start;
          if (Math.abs(dx) > 45) select(dx < 0 ? Math.min(count - 1, i + 1) : Math.max(0, i - 1));
        }}
      >
        {badge && <span className="absolute left-3 top-3 z-10 rounded bg-kraft px-2.5 py-1 font-body text-xs font-semibold text-ink">{badge}</span>}

        {images.map(
          (src, k) =>
            mounted.includes(k) && (
              <Pic
                key={src}
                src={src}
                alt={k === shown ? `${alt}${count > 1 ? ` : photo ${k + 1} sur ${count}` : ""}` : ""}
                preset="product"
                priority={k === 0}
                sizes={SIZES}
                onLoad={() => onLoad(k)}
                aria-hidden={k !== shown}
                className={`absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-150 ${k === shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
              />
            ),
        )}

        {count > 1 && (
          <>
            <button type="button" className={`${arrow} left-2`} disabled={i === 0} onClick={() => select(i - 1)} aria-label="Photo précédente">‹</button>
            <button type="button" className={`${arrow} right-2`} disabled={i === count - 1} onClick={() => select(i + 1)} aria-label="Photo suivante">›</button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 font-body text-xs font-semibold text-white" aria-hidden>
              {i + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div role="group" aria-label="Photos de l'article" className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {images.map((src, k) => (
            <button
              key={src}
              type="button"
              ref={(el) => {
                thumbs.current[k] = el;
              }}
              onClick={() => select(k)}
              aria-label={`Voir la photo ${k + 1} sur ${count}`}
              aria-current={k === i ? "true" : undefined}
              className={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border-2 bg-white transition-colors sm:h-20 sm:w-20 ${
                k === i ? "border-water" : "border-ink/15 hover:border-ink/40"
              }`}
            >
              <Pic src={src} alt="" preset="product" sizes="80px" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
