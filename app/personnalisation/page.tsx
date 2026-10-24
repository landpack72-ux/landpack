import { getProducts } from "@/lib/data";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubPageHero from "../components/SubPageHero";
import SubPageCta from "../components/SubPageCta";
import ShowcaseGallery from "../components/ShowcaseGallery";
import StampBadge from "../components/StampBadge";

export const metadata: Metadata = {
  title: "Personnalisation — Landpack",
  description:
    "Sacs kraft, sacs non tissés, boîtes et gobelets personnalisés à votre logo et vos couleurs.",
  alternates: {
    canonical: "/personnalisation",
  },
  openGraph: {
    title: "Personnalisation — Landpack",
    description:
      "Sacs kraft, sacs non tissés, boîtes et gobelets personnalisés à votre logo et vos couleurs.",
    url: "/personnalisation",
  },
};

const SHOWCASE = [
  {
    src: "/images/perso1.webp",
    alt: "Boîtes kraft personnalisées Landpack",
    caption: "Boîtes kraft — repas à emporter, robustes et personnalisables",
  },
  {
    src: "/images/perso2.webp",
    alt: "Sacs personnalisés colorés Landpack",
    caption: "Sacs — vos couleurs, votre logo, bien visible",
  },
  {
    src: "/images/perso3.webp",
    alt: "Housses vêtements personnalisées Landpack",
    caption: "Housses — pour le textile et le pressing",
  },
];

export default async function PersonnalisationPage() {
  const items = await getProducts();
  return (
    <>
      <Header />
      <main>
        <SubPageHero
          image="/images/perso1.webp"
          eyebrow="Personnalisation"
          title="Vos articles, à votre marque."
          text="Sacs, boîtes et gobelets imprimés à votre logo et vos couleurs, pour un emballage qui vous ressemble."
        />

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              En images
            </StampBadge>
            <h2 className="mt-5 font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              Trois univers, un seul logo.
            </h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">
              Boîtes, sacs ou housses : votre marque s&apos;imprime partout où
              vous en avez besoin.
            </p>

            <div className="mt-10">
              <ShowcaseGallery images={SHOWCASE} />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              Le catalogue
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              Quatre supports, une seule marque.
            </h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">
              Chaque référence se personnalise entièrement : couleurs, logo,
              finitions. Le reste, c&apos;est nous qui l&apos;imprimons.
            </p>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <article
                  key={it.id ?? it.name}
                  className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-paper transition-shadow hover:shadow-[6px_6px_0_0_rgba(23,36,43,0.12)]"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={it.image_url ?? "/images/logo.webp"}
                      alt={`${it.name} personnalisable Landpack`}
                      className="photo-kraft-tone h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl text-ink">{it.name}</h3>
                    <p className="mt-2 font-body text-sm text-ink-soft">{it.description}</p>
                    {it.price_label && (
                      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-water">
                        {it.price_label}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SubPageCta text="Prêt à imprimer votre logo ?" />
      </main>
      <Footer />
    </>
  );
}
