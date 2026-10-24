import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubPageHero from "../components/SubPageHero";
import SubPageCta from "../components/SubPageCta";
import ShowcaseGallery from "../components/ShowcaseGallery";
import StampBadge from "../components/StampBadge";

export const metadata: Metadata = {
  title: "Sur mesure — Landpack",
  description:
    "Un format qui n'existe pas encore ? Landpack le développe avec vous : prototypes, dimensions et matières adaptées.",
  alternates: {
    canonical: "/sur-mesure",
  },
  openGraph: {
    title: "Sur mesure — Landpack",
    description:
      "Un format qui n'existe pas encore ? Landpack le développe avec vous : prototypes, dimensions et matières adaptées.",
    url: "/sur-mesure",
  },
};

const SHOWCASE = [
  {
    src: "/images/surmesure1.webp",
    alt: "Emballage sur mesure pour esquimaux Landpack",
    caption: "Format thermoscellé sur mesure, pour un produit alimentaire précis",
  },
  {
    src: "/images/surmesure2.webp",
    alt: "Sachet transparent sur mesure Landpack",
    caption: "Sachet transparent, haut et étroit, taillé pour un produit hors standard",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Vous décrivez votre besoin",
    text: "Le produit à emballer, le volume, le budget — un simple échange suffit pour démarrer.",
  },
  {
    n: "02",
    title: "On propose un prototype",
    text: "Format, matière et finition adaptés à votre produit, avec un échantillon avant toute production.",
  },
  {
    n: "03",
    title: "Validation & petite série",
    text: "Dès 500 pièces, pas besoin d'être une grande enseigne pour lancer un format sur mesure.",
  },
];

export default function SurMesurePage() {
  return (
    <>
      <Header />
      <main>
        <SubPageHero
          image="/images/surmesure1.webp"
          eyebrow="Sur mesure"
          title="Un format qui n'existe pas encore ?"
          text="On le développe avec vous : prototypes, dimensions et matières adaptées à votre produit."
        />

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              Exemples
            </StampBadge>
            <h2 className="mt-5 font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              Deux formats, deux besoins précis.
            </h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">
              Chaque produit a sa propre forme — l&apos;emballage doit
              s&apos;y adapter, pas l&apos;inverse.
            </p>

            <div className="mt-10">
              <ShowcaseGallery images={SHOWCASE} tone="soft" />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              Le process
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              De l&apos;idée au prototype.
            </h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">
              Trois étapes simples pour un emballage qui correspond
              exactement à votre produit.
            </p>

            <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px border-t-2 border-dashed border-ink/15 sm:block"
              />
              {STEPS.map((s) => (
                <div key={s.n} className="relative">
                  <span className="font-display text-5xl text-water">{s.n}</span>
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

        <SubPageCta text="Un format en tête ?" />
      </main>
      <Footer />
    </>
  );
}
