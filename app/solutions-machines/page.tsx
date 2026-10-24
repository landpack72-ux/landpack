import { getBlocks } from "@/lib/data";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubPageHero from "../components/SubPageHero";
import SubPageCta from "../components/SubPageCta";
import StampBadge from "../components/StampBadge";

export const metadata: Metadata = {
  title: "Machines, consommables & solutions intelligentes d'emballage — Landpack",
  description:
    "Landpack propose des machines d'emballage (sous vide, scelleuses de gobelets et de barquettes, mise sous film), les consommables associés (films, sachets, barquettes, couvercles) et des solutions intelligentes (pack complet restaurant, diagnostic emballage, click & collect, anti-fuite, branding) pour la restauration, l'agroalimentaire, les cafés et traiteurs au Maroc.",
  alternates: {
    canonical: "/solutions-machines",
  },
  openGraph: {
    title: "Machines, consommables & solutions intelligentes d'emballage — Landpack",
    description:
      "Machines sous vide, scelleuses de gobelets et de barquettes, consommables et solutions intelligentes (pack restaurant, click & collect, anti-fuite, branding) pour la restauration et l'agroalimentaire au Maroc.",
    url: "/solutions-machines",
  },
};

export default async function SolutionsMachinesPage() {
  const machines = await getBlocks("machines");
  const consommables = await getBlocks("consommables");
  const smart = await getBlocks("smart_solutions");
  return (
    <>
      <Header />
      <main>
        <SubPageHero
          image="/images/solu1.webp"
          eyebrow="Machines & Solutions intelligentes"
          title="Machines, consommables et solutions intelligentes d'emballage."
          text="En complément de nos solutions d'emballage personnalisées, Landpack propose une sélection de machines, équipements et consommables pour la restauration, l'agroalimentaire, les cafés, traiteurs et commerces."
        />

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              Petites machines d&apos;emballage
            </StampBadge>
            <h2 className="mt-5 font-display text-4xl text-ink sm:text-5xl">
              Au-delà de l&apos;impression.
            </h2>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {machines.map((s, i) => (
                <div
                  key={s.id ?? s.title}
                  className="rounded-2xl border-2 border-ink/10 bg-paper p-6"
                >
                  <span className="font-mono text-xs text-water">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-2xl text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24 bg-cream/40">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="stamp">
              Consommables pour machines
            </StampBadge>
            <p className="mt-5 max-w-2xl font-body text-ink-soft">
              Landpack accompagne aussi ses clients avec les consommables
              nécessaires au fonctionnement des équipements.
            </p>

            <div className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {consommables.map((s) => (
                <div key={s.id ?? s.title} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <h3 className="font-display text-base text-ink">
                      {s.title}
                    </h3>
                    {s.body && (
                      <p className="mt-0.5 font-body text-sm text-ink-soft">
                        {s.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              Smart Solutions by Landpack
            </StampBadge>
            <p className="mt-5 max-w-2xl font-body text-ink-soft">
              Pour aller plus loin, Landpack propose des solutions
              intelligentes et pratiques pour optimiser l&apos;emballage et
              les opérations quotidiennes.
            </p>

            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {smart.map((s) => (
                <div key={s.id ?? s.title} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <h3 className="font-display text-base text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-0.5 font-body text-sm text-ink-soft">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border-2 border-ink/10 bg-water-dark p-6 sm:p-8">
              <p className="font-display text-lg text-cream sm:text-xl">
                Landpack — Une solution globale pour votre emballage
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-wide text-cream/70">
                Emballage · Personnalisation · Machines · Consommables ·
                Conseil · Optimisation
              </p>
              <p className="mt-3 font-body text-sm text-cream/85">
                De l&apos;emballage à la machine, Landpack vous accompagne
                dans toute votre chaîne de conditionnement.
              </p>
            </div>
          </div>
        </section>

        <SubPageCta text="Un besoin d'équipement ?" />
      </main>
      <Footer />
    </>
  );
}
