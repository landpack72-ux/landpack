import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrderForm, { type Model } from "../components/OrderForm";
import { getCatalogue, getSettings } from "@/lib/data";
import { minQty, money, rulesFrom } from "@/lib/pricing";
import { modelTitle } from "@/lib/defaults";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/devis", {
  title: "Demander un devis : emballages alimentaires personnalisés | Landpack",
  description:
    "Choisissez votre boîte, sachet, sac kraft, gobelet ou carton, ajoutez votre logo, indiquez la quantité et votre adresse : l'équipe Landpack vous rappelle.",
});

export default async function DevisPage() {
  const [categories, settings] = await Promise.all([getCatalogue(), getSettings()]);
  const rules = rulesFrom(settings);
  const models: Model[] = categories.flatMap((c) =>
    c.items.map((p) => ({
      id: p.id ?? `${c.slug}-${p.name}`,
      label: modelTitle(p),
      group: c.name,
      min_qty: minQty(p.min_qty, rules),
      price_label: p.unit_price != null ? `${money(p.unit_price)} / pièce` : null,
    })),
  );

  return (
    <>
      <Header />
      <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Demander un devis</h1>
          <p className="mt-3 font-body text-ink-soft">
            Choisissez votre article, ajoutez votre logo, puis indiquez la quantité souhaitée :
            nous vous rappelons rapidement avec un prix.
          </p>
          <div className="mt-8 rounded-md border border-ink/10 bg-white p-6 sm:p-8">
            <OrderForm models={models} source="Demande de devis" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
