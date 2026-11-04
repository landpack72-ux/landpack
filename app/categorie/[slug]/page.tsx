import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import ProductCard from "../../components/ProductCard";
import { getCatalogue, getCategory, getSettings } from "@/lib/data";
import { rulesFrom } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalogue()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: "Catégorie introuvable", robots: { index: false } };
  return pageMetadata(
    `/categorie/${slug}`,
    {
      title: `${c.name} personnalisés à votre logo au Maroc | Landpack`,
      description: `${c.description ?? c.name} ${c.items.length} modèles personnalisés avec votre logo. Livraison partout au Maroc.`,
    },
    c.image_url ?? undefined,
  );
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [category, all, settings] = await Promise.all([getCategory(slug), getCatalogue(), getSettings()]);
  if (!category) notFound();
  const rules = rulesFrom(settings);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: category.name }]} />

        <div className="mt-5 border-b border-ink/10 pb-5">
          <h1 className="font-display text-2xl text-ink sm:text-3xl lg:text-4xl">{category.name}</h1>
          <span className="mt-2 block h-1 w-14 rounded-full bg-kraft" />
          {category.description && <p className="mt-3 max-w-3xl whitespace-pre-line font-body text-ink-soft">{category.description}</p>}
          <p className="mt-2 font-body text-sm text-ink-soft">
            {category.items.length} modèle{category.items.length > 1 ? "s" : ""} · imprimés à votre logo
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {category.items.map((p, i) => (
            <ProductCard key={p.id ?? p.name} item={p} id={p.id ?? `${category.slug}-${i + 1}`} rules={rules} />
          ))}
        </div>

        <section className="mt-12 border-t border-ink/10 pt-8 sm:mt-16">
          <h2 className="font-display text-xl text-ink">Autres catégories</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
            {all
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categorie/${c.slug}`}
                    className="block rounded-md border border-ink/10 bg-white px-4 py-3 font-body text-sm font-semibold text-ink transition-colors hover:border-water/50 hover:bg-paper"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
