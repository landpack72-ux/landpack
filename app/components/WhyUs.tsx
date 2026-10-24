import StampBadge from "./StampBadge";

const REASONS = [
  {
    title: "Petites séries acceptées",
    text: "Dès 500 pièces, pas besoin d'être une grande enseigne pour avoir votre logo dessus.",
  },
  {
    title: "Épreuve avant impression",
    text: "Vous validez un visuel exact du rendu avant qu'une seule pièce ne soit imprimée.",
  },
  {
    title: "Atelier à Casablanca",
    text: "Production locale, délais courts, suivi direct avec l'équipe qui imprime vos commandes.",
  },
  {
    title: "Kraft comme verre transparent",
    text: "Même exigence qualité sur les deux familles de produits, du papier au plastique alimentaire.",
  },
];

export default function WhyUs() {
  return (
    <section id="pourquoi" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <StampBadge rotate={-3}>Pourquoi Landpack</StampBadge>
            <h2 className="mt-5 font-display text-5xl text-ink sm:text-6xl">
              On imprime des emballages.
              <br />
              On construit des marques.
            </h2>
            <p className="mt-6 max-w-md font-body text-ink-soft">
              Un sac ou un gobelet, c&apos;est souvent le dernier contact
              entre votre client et votre marque. Landpack s&apos;assure qu&apos;il
              soit à votre image, du premier au dernier exemplaire.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {REASONS.map((r, i) => (
              <div
                key={r.title}
                className="rounded-2xl border-2 border-ink/10 bg-paper p-6"
              >
                <span
                  className={`font-mono text-xs ${i % 2 === 0 ? "text-water" : "text-nature"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">
                  {r.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
