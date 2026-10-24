import StampBadge from "./StampBadge";

const SHOTS = [
  { id: 1080, r: -4, label: "Café Nour — gobelets 12oz" },
  { id: 219, r: 3, label: "Boulangerie Amal — sacs 26cm" },
  { id: 1074, r: -3, label: "Snack Medina — sacs 17cm" },
  { id: 292, r: 5, label: "Juice Bar Lima — gobelets 16oz" },
  { id: 1078, r: -2, label: "Traiteur Zahra — sacs 28cm" },
];

export default function Gallery() {
  return (
    <section id="realisations" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="ink">
          Nos réalisations
        </StampBadge>
        <h2 className="mt-5 max-w-xl font-display text-5xl text-ink sm:text-6xl">
          Des marques, sur du kraft, dans la vraie vie.
        </h2>
        <p className="mt-4 max-w-lg font-body text-ink-soft">
          Un aperçu de commandes livrées récemment — chaque visuel ci-dessous
          sera remplacé par vos propres photos produits.
        </p>

        <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [scrollbar-width:thin]">
          {SHOTS.map((s) => (
            <figure
              key={s.id}
              style={{ transform: `rotate(${s.r}deg)` }}
              className="group w-64 shrink-0 snap-center rounded-2xl border-2 border-ink/10 bg-cream p-3 pb-5 shadow-[6px_6px_0_0_rgba(42,31,22,0.12)] transition-transform hover:-translate-y-1 hover:rotate-0 sm:w-72"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={`https://picsum.photos/id/${s.id}/500/560`}
                  alt={`${s.label} — photo à remplacer`}
                  className="photo-kraft-tone h-64 w-full object-cover sm:h-72"
                />
              </div>
              <figcaption className="mt-3 px-1 font-display text-xl text-ink">
                {s.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
