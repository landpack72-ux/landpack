import StampBadge from "./StampBadge";

const POINTS = [
  "Audit packaging et coûts matière",
  "Formation des équipes atelier",
  "Veille tendances et réglementation",
];

export default function AdviceSection() {
  return (
    <section
      id="conseils"
      className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border-2 border-ink/10 bg-water-dark sm:rounded-[1.75rem]">
        <div className="grid gap-8 p-6 sm:gap-10 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-16">
          <div className="min-w-0">
            <StampBadge rotate={-3} className="border-cream/50 !text-cream">
              Accompagnement
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-2xl leading-[1.1] text-cream sm:text-4xl lg:text-5xl">
              Conseils & Accompagnement
            </h2>
            <p className="mt-4 max-w-md font-body text-sm text-cream/85 sm:text-base">
              Un regard extérieur pour optimiser vos coûts et votre image
              packaging — au-delà de l&apos;impression, on vous aide à faire
              les bons choix.
            </p>

            <ul className="mt-6 space-y-3 sm:mt-7">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="font-body text-sm text-cream/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 rounded-2xl border border-cream/20 bg-cream/10 p-5 backdrop-blur-sm sm:p-9">
            <p className="break-words font-display text-lg leading-snug text-cream sm:text-2xl">
              Envie de construire votre packaging avec nous ?
            </p>
            <p className="mt-3 font-body text-sm text-cream/80">
              Rejoignez les marques qui font confiance à Landpack pour leurs
              emballages, du premier échange jusqu&apos;à la livraison.
            </p>
            <a
              href="/#contact"
              className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Nous rejoindre
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
