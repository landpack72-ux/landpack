"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StampBadge from "./StampBadge";

const SLIDES = [
  {
    image: "/images/tout.webp",
    eyebrow: "Landpack",
    title: "Tous vos emballages, une seule adresse.",
    text: "Sacs, boîtes et gobelets personnalisés à votre logo.",
  },
  {
    image: "/images/sackraft.webp",
    eyebrow: "Spécialité n°1",
    title: "Sacs kraft, votre logo dessus.",
    text: "Impression de votre logo et vos couleurs, pour un emballage à votre image.",
  },
  {
    image: "/images/goblets.webp",
    eyebrow: "Spécialité n°2",
    title: "Gobelets, marque bien visible.",
    text: "Vos boissons servies avec votre identité, jusque dans les détails.",
  },
  {
    image: "/images/boitekraft.webp",
    eyebrow: "Spécialité n°3",
    title: "Boîtes kraft, prêtes à personnaliser.",
    text: "Robustes et personnalisables, idéales pour le repas à emporter.",
  },
];

const SLIDE_DURATION = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
    setProgressKey((k) => k + 1);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index]);

  const slide = SLIDES[index];

  return (
    <section
      id="top"
      className="relative h-[100dvh] max-h-[780px] min-h-[500px] w-full overflow-hidden bg-ink sm:h-[92dvh]"
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt=""
            className={`photo-kraft-tone h-full w-full object-cover ${
              i === index ? "animate-[kenburns_7s_ease-out_both]" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-water-dark/55 via-ink/18 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/25 via-ink/5 to-transparent" />
        </div>
      ))}

      {/* Contenu texte */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-10">
        <StampBadge rotate={-3} className="w-fit border-cream/60 !text-cream bg-ink/20">
          Atelier packaging · Casablanca
        </StampBadge>

        <p
          key={`eyebrow-${index}`}
          className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-gold"
        >
          {slide.eyebrow}
        </p>

        <h1
          key={`title-${index}`}
          className="mt-3 max-w-2xl font-display text-4xl leading-[0.95] text-cream drop-shadow-[0_3px_14px_rgba(15,30,38,0.55)] sm:text-6xl md:text-7xl lg:text-[5.2rem]"
        >
          {slide.title}
        </h1>

        <p
          key={`text-${index}`}
          className="mt-4 max-w-md font-body text-base leading-relaxed text-cream/90 drop-shadow-[0_2px_8px_rgba(15,30,38,0.5)] sm:mt-6 sm:text-lg"
        >
          {slide.text}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
          <a
            href="#devis"
            className="rounded-full bg-water px-5 py-3 text-sm font-medium text-cream shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-3.5 sm:text-base"
          >
            Demander un devis gratuit
          </a>
          <a
            href="#produits"
            className="rounded-full border-2 border-cream/70 px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink sm:px-7 sm:py-3.5 sm:text-base"
          >
            Voir les produits
          </a>
        </div>
      </div>

      {/* Flèches */}
      <button
        onClick={prev}
        aria-label="Diapositive précédente"
        className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 bg-ink/30 text-cream backdrop-blur transition-colors hover:bg-cream hover:text-ink lg:flex lg:left-6"
      >
        ←
      </button>
      <button
        onClick={next}
        aria-label="Diapositive suivante"
        className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 bg-ink/30 text-cream backdrop-blur transition-colors hover:bg-cream hover:text-ink lg:flex lg:right-6"
      >
        →
      </button>

      {/* Dots + progress bar */}
      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.image}
            onClick={() => goTo(i)}
            aria-label={`Aller à la diapositive ${i + 1}`}
            className="group relative h-1.5 w-10 overflow-hidden rounded-full bg-cream/30"
          >
            {i === index && (
              <span
                key={progressKey}
                className="absolute inset-y-0 left-0 block rounded-full bg-gold"
                style={{
                  animation: `slide-progress ${SLIDE_DURATION}ms linear forwards`,
                }}
              />
            )}
            {i < index && <span className="absolute inset-0 rounded-full bg-cream/80" />}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.09); }
        }
        @keyframes slide-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
