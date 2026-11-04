"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Step = { title: string; text: string };

// « Comment commander » : frise interactive. Au survol (ou au toucher, ou au clavier) d'une étape,
// la ligne se remplit jusqu'à elle ; sans interaction, les étapes défilent doucement toutes seules.
export default function HowToOrder({ title, text, steps }: { title: string; text?: string; steps: Step[] }) {
  const n = steps.length;
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (release.current) clearTimeout(release.current);
    };
  }, []);

  useEffect(() => {
    if (n < 2 || hold) return;
    const timer = setInterval(() => {
      if (!reduced.current) setActive((a) => (a + 1) % n);
    }, 3200);
    return () => clearInterval(timer);
  }, [n, hold]);

  function interact(i: number) {
    setActive(i);
    setHold(true);
    if (release.current) clearTimeout(release.current);
    release.current = setTimeout(() => setHold(false), 7000); // reprend seul si on ne touche plus à rien
  }

  if (n === 0) return null;

  return (
    <section aria-labelledby="how-title" className="mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-10">
      <div className="overflow-hidden rounded-xl bg-paper px-5 py-9 sm:px-10 sm:py-12 lg:px-14">
        <div className="text-center">
          <h2 id="how-title" className="font-accent text-[clamp(1.75rem,4.2vw,3rem)] font-bold leading-tight text-ink">
            {title}
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-kraft" />
          {text && <p className="mx-auto mt-4 max-w-xl font-body text-sm text-ink-soft sm:text-base">{text}</p>}
        </div>

        <ol
          onMouseLeave={() => setHold(false)}
          style={{ "--n": n } as CSSProperties}
          className="mt-9 grid gap-5 md:mt-12 md:gap-0 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        >
          {steps.map((s, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li
                key={s.title + i}
                onMouseEnter={() => interact(i)}
                onFocus={() => interact(i)}
                className="relative flex min-w-0 gap-3 sm:gap-4 md:flex-col md:items-center md:gap-0 md:px-3"
              >
                {/* Segment de ligne vers l'étape suivante : vertical sur téléphone, horizontal sur ordinateur */}
                {i < n - 1 && (
                  <>
                    <span
                      aria-hidden
                      className={`absolute left-7 top-7 h-[calc(100%+1.25rem)] w-0.5 -translate-x-1/2 transition-colors duration-500 md:hidden ${done ? "bg-water" : "bg-ink/15"}`}
                    />
                    <span
                      aria-hidden
                      className={`absolute left-1/2 top-7 hidden h-0.5 w-full -translate-y-1/2 transition-colors duration-500 md:block ${done ? "bg-water" : "bg-ink/15"}`}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => interact(i)}
                  aria-label={`Étape ${i + 1} : ${s.title}`}
                  aria-current={current ? "step" : undefined}
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 font-accent text-2xl font-bold transition-all duration-300 ${
                    current
                      ? "scale-110 border-water bg-water text-cream shadow-lg ring-4 ring-kraft/60"
                      : done
                        ? "border-water bg-water text-cream"
                        : "border-water/40 bg-white text-water hover:border-water"
                  }`}
                >
                  {i + 1}
                </button>

                <div
                  onClick={() => interact(i)}
                  className={`min-w-0 flex-1 rounded-lg border bg-white p-4 transition-all duration-300 sm:p-5 md:mt-6 md:w-full md:text-center ${
                    current ? "border-water shadow-xl md:-translate-y-1.5" : "border-ink/10 shadow-sm"
                  }`}
                >
                  <h3 className="font-accent text-lg font-bold leading-snug text-ink [overflow-wrap:anywhere] sm:text-xl">{s.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft [overflow-wrap:anywhere]">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
