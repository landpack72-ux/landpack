"use client";

import { useEffect, useState } from "react";
import Pic from "./Pic";

type Slide = { image: string; title: string; text: string; cta: string; href: string };

// Diaporama de l'accueil : défilement automatique, pause au survol, points de navigation.
export default function Slider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="relative h-60 overflow-hidden rounded-md bg-ink sm:h-auto sm:aspect-[16/7] lg:aspect-[16/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="diaporama"
      aria-label="Nos emballages personnalisés"
    >
      {slides.map((s, i) => (
        <div
          key={s.title + i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Pic src={s.image} alt="" preset="slide" priority={i === 0} sizes="(min-width: 1280px) 1200px, 100vw" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl px-5 sm:px-12">
              <p className="font-display text-xl leading-tight text-white sm:text-4xl">{s.title}</p>
              {s.text && <p className="mt-3 hidden font-body text-sm text-white/90 sm:block sm:text-base">{s.text}</p>}
              {s.cta && s.href && (
                <a
                  href={s.href}
                  tabIndex={i === index ? 0 : -1}
                  className="mt-4 inline-block rounded-md bg-kraft px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-kraft-dark sm:mt-5"
                >
                  {s.cta}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          {slides.map((s, i) => (
            <button
              key={s.title + i}
              type="button"
              aria-label={`Diapositive ${i + 1} sur ${count}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group p-3.5"
            >
              <span className={`block h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2.5 bg-white/60 group-hover:bg-white/85"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
