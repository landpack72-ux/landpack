import StampBadge from "./StampBadge";

const STEPS = [
  {
    n: "01",
    title: "Vous envoyez votre logo",
    text: "Fichier vectoriel ou simple image, on s'occupe de la mise en forme pour l'impression.",
  },
  {
    n: "02",
    title: "Vous choisissez le format",
    text: "Sac 17, 26 ou 28 cm, gobelet 12, 14 ou 16 oz — ou une combinaison des deux.",
  },
  {
    n: "03",
    title: "On imprime en atelier",
    text: "Épreuve validée avec vous avant lancement, impression et contrôle qualité pièce par pièce.",
  },
  {
    n: "04",
    title: "Livraison chez vous",
    text: "Conditionnement par carton, livraison à Casablanca et partout au Maroc.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="relative overflow-hidden bg-paper/40 px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="ink">
          Le process
        </StampBadge>
        <h2 className="mt-5 max-w-xl font-display text-5xl text-ink sm:text-6xl">
          De votre logo au comptoir, en 4 étapes.
        </h2>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px border-t-2 border-dashed border-ink/15 lg:block"
          />
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="font-display text-5xl text-water">
                {s.n}
              </span>
              <h3 className="mt-3 font-body text-lg font-medium text-ink">
                {s.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
