import StampBadge from "./StampBadge";

const QUOTES = [
  {
    quote:
      "Nos clients reconnaissent le sac avant même d'entrer dans la boutique. C'est devenu une partie de notre identité.",
    name: "Amal B.",
    role: "Boulangerie Amal",
    r: -3,
  },
  {
    quote:
      "Délai tenu, épreuve validée en deux jours, et le rendu du logo sur le gobelet transparent est bien plus net que prévu.",
    name: "Yassine K.",
    role: "Juice Bar Lima",
    r: 2,
  },
  {
    quote:
      "On a pu commander seulement 500 sacs pour tester, sans minimum énorme. Parfait pour une ouverture.",
    name: "Nour T.",
    role: "Café Nour",
    r: -2,
  },
];

export default function Testimonials() {
  return (
    <section id="avis" className="bg-paper/60 px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="stamp">
          Ils nous font confiance
        </StampBadge>
        <h2 className="mt-5 font-display text-5xl text-ink sm:text-6xl">
          Des étiquettes, pas des avis en carton.
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTES.map((q) => (
            <div
              key={q.name}
              style={{ transform: `rotate(${q.r}deg)` }}
              className="relative rounded-xl border-2 border-ink/10 bg-cream p-5 sm:p-7 shadow-[5px_5px_0_0_rgba(42,31,22,0.1)]"
            >
              <span
                aria-hidden
                className="absolute -top-3 left-8 h-6 w-3 rounded-full bg-water/70"
              />
              <p className="font-display text-2xl leading-snug text-ink">
                &ldquo;{q.quote}&rdquo;
              </p>
              <p className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-soft">
                {q.name} · {q.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
