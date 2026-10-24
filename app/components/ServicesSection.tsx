import StampBadge from "./StampBadge";

const SERVICES = [
  {
    tag: "Impression logo",
    title: "Emballages Personnalisés",
    image: "https://picsum.photos/id/1060/700/500",
    text: "Vos couleurs et votre logo imprimés sur des supports du quotidien.",
    articles: [
      "Sacs kraft 17 / 26 / 28 cm",
      "Gobelets transparents 12 / 14 / 16 oz",
      "Boîtes à emporter personnalisées",
    ],
  },
  {
    tag: "Sur-mesure",
    title: "Emballage Sur Mesure",
    image: "https://picsum.photos/id/1078/700/500",
    text: "Un format qui n'existe pas encore ? On le développe avec vous.",
    articles: [
      "Prototypage et échantillons",
      "Dimensions et matières adaptées",
      "Petites séries dès 500 pièces",
    ],
  },
  {
    tag: "Équipement",
    title: "Solutions & Machines",
    image: "https://picsum.photos/id/292/700/500",
    text: "Le matériel qui accompagne vos emballages, choisi et installé pour vous.",
    articles: [
      "Machines de scellage et banderolage",
      "Étiqueteuses et codeuses",
      "Maintenance et pièces détachées",
    ],
  },
  {
    tag: "Accompagnement",
    title: "Conseils & Coaching",
    image: "https://picsum.photos/id/1074/700/500",
    text: "Un regard extérieur pour optimiser vos coûts et votre image packaging.",
    articles: [
      "Audit packaging et coûts matière",
      "Formation des équipes atelier",
      "Veille tendances et réglementation",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="ink">
          Nos expertises
        </StampBadge>
        <h2 className="mt-5 max-w-xl font-display text-5xl text-ink sm:text-6xl">
          Quatre façons de vous accompagner.
        </h2>
        <p className="mt-4 max-w-lg font-body text-ink-soft">
          De l&apos;impression du logo jusqu&apos;au choix des machines, Landpack
          couvre tout le parcours de votre emballage.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className="group overflow-hidden rounded-[1.75rem] border-2 border-ink/10 bg-paper transition-shadow hover:shadow-[6px_6px_0_0_rgba(23,36,43,0.12)]"
            >
              <div className="relative h-52 overflow-hidden sm:h-56">
                <img
                  src={s.image}
                  alt={`${s.title} — photo à remplacer par votre visuel`}
                  className="photo-kraft-tone h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="stamp-badge absolute left-4 top-4 rounded-full bg-water px-3.5 py-1 text-[11px] text-cream">
                  {s.tag}
                </span>
              </div>

              <div className="p-7">
                <h3 className="font-display text-3xl text-ink">{s.title}</h3>
                <p className="mt-2 font-body text-sm text-ink-soft">{s.text}</p>

                <ul className="mt-5 space-y-2 border-t-2 border-dashed border-ink/15 pt-4">
                  {s.articles.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2 font-body text-sm text-ink-soft"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nature" />
                      {a}
                    </li>
                  ))}
                </ul>

                <a
                  href="#devis"
                  className="mt-6 inline-flex items-center gap-2 font-medium text-water transition-colors hover:text-water-dark"
                >
                  En savoir plus
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
