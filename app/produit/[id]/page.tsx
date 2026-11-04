import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import ProductCard from "../../components/ProductCard";
import Pic from "../../components/Pic";
import ProductPurchase from "../../components/ProductPurchase";
import { getCatalogue, getProduct, getSettings } from "@/lib/data";
import { modelTitle } from "@/lib/defaults";
import { absoluteUrl } from "@/lib/format";
import { minQty, money, piecesLabel, rulesFrom, fmtInt } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getCatalogue()).flatMap((c) => c.items.flatMap((p) => (p.id ? [{ id: p.id }] : [])));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const found = await getProduct(id);
  if (!found) return { title: "Article introuvable", robots: { index: false } };
  const { product: p, category: c } = found;
  return pageMetadata(
    `/produit/${id}`,
    {
      title: `${modelTitle(p)} : ${c.name} personnalisés | Landpack`,
      description: `${modelTitle(p)}, ${c.name.toLowerCase()} personnalisés avec votre logo${p.unit_price != null ? `, dès ${money(p.unit_price)} la pièce` : ""}. ${p.description ?? ""} Commande en ligne, livraison partout au Maroc.`.replace(/\s+/g, " ").trim(),
    },
    p.image_url ?? c.image_url ?? undefined,
  );
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const [found, settings] = await Promise.all([getProduct(id), getSettings()]);
  if (!found) notFound();
  const { product: p, category: c } = found;
  const rules = rulesFrom(settings);
  const min = minQty(p.min_qty, rules);

  const title = modelTitle(p);
  const others = c.items.filter((x) => x.id !== p.id).slice(0, 4);
  const discountOn = rules.discountThreshold > 0 && rules.discountPercent > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    sku: p.id,
    category: c.name,
    brand: { "@type": "Brand", name: "Landpack" },
    description: p.description || `${title} : ${c.name} personnalisés à votre logo.`,
    ...(p.image_url ? { image: absoluteUrl(p.image_url) } : {}),
    ...(p.unit_price != null
      ? { offers: { "@type": "Offer", priceCurrency: "MAD", price: p.unit_price.toFixed(2), availability: "https://schema.org/InStock", url: absoluteUrl(`/produit/${p.id}`) } }
      : {}),
  };

  const rows: [string, string][] = [
    ...(p.dimensions ? ([["Dimensions", p.dimensions]] as [string, string][]) : []),
    ["Prix par pièce", p.unit_price != null ? money(p.unit_price) : "sur devis"],
    ["Quantité minimale", `${piecesLabel(min)}, par paliers de ${rules.qtyStep}`],
    ...(discountOn ? ([["Remise", `${rules.discountPercent} % dès ${fmtInt(rules.discountThreshold)} pièces`]] as [string, string][]) : []),
    ["Personnalisation", "impression de votre logo"],
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: c.name, href: `/categorie/${c.slug}` }, { label: title }]} />

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Photo */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-ink/10 bg-white sm:aspect-square lg:sticky lg:top-6">
              <span className="absolute left-3 top-3 z-10 rounded bg-kraft px-2.5 py-1 font-body text-xs font-semibold text-ink">
                Personnalisable
              </span>
              {p.image_url && (
                <Pic src={p.image_url} alt={`${title} personnalisable`} preset="product" priority sizes="(min-width: 1024px) 560px, 92vw" className="h-full w-full object-contain p-4" />
              )}
            </div>
          </div>

          {/* Informations et achat */}
          <div className="min-w-0">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-water">
              <Link href={`/categorie/${c.slug}`} className="inline-block py-1.5 hover:underline">{c.name}</Link>
            </p>
            <h1 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{title}</h1>
            <span className="mt-3 block h-1 w-14 rounded-full bg-kraft" />

            {p.unit_price != null && (
              <p className="mt-4 font-body text-ink">
                <span className="font-display text-3xl">{money(p.unit_price)}</span> <span className="text-sm text-ink-soft">par pièce</span>
              </p>
            )}

            {p.description && <p className="mt-4 whitespace-pre-line font-body text-ink-soft">{p.description}</p>}

            <dl className="mt-5 divide-y divide-ink/10 overflow-hidden rounded-md border border-ink/10 font-body text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-0.5 bg-white px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>

            <div id="commander" className="mt-6 scroll-mt-6 rounded-md border border-ink/10 bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg text-ink">Personnaliser et commander</h2>
              <p className="mt-1 font-body text-sm text-ink-soft">
                Choisissez la quantité, chargez votre logo, puis ajoutez l&apos;article à votre panier.
              </p>
              <div className="mt-5">
                <ProductPurchase
                  product={{
                    id: p.id,
                    title,
                    category: c.name,
                    categorySlug: c.slug,
                    image: p.image_url,
                    unit_price: p.unit_price,
                    min_qty: min,
                  }}
                  rules={rules}
                />
              </div>
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-12 border-t border-ink/10 pt-8 sm:mt-16">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-xl text-ink sm:text-2xl">Autres modèles : {c.name}</h2>
              <Link href={`/categorie/${c.slug}`} className="inline-block py-2 font-body text-sm font-semibold text-water hover:underline">
                Voir toute la catégorie →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-4">
              {others.map((o) => (
                <ProductCard key={o.id} item={o} id={o.id as string} rules={rules} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <script
        type="application/ld+json"
        // "<" est échappé : aucun contenu saisi dans l'admin ne peut refermer la balise <script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
