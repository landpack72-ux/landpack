import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Slider from "./components/Slider";
import ProductCard from "./components/ProductCard";
import HowToOrder from "./components/HowToOrder";
import Pic from "./components/Pic";
import { getCatalogue, getList, getSettings, getText } from "@/lib/data";
import { rulesFrom } from "@/lib/pricing";

export default async function Home() {
  const [slides, categories, stepsHead, steps, settings] = await Promise.all([
    getList("home.slides"),
    getCatalogue(),
    getText("home.steps_head"),
    getList("home.steps"),
    getSettings(),
  ]);
  const rules = rulesFrom(settings);

  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">
          Emballages alimentaires personnalisés au Maroc : boîtes, sachets, sacs kraft, gobelets et cartons
        </h1>

        <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-10">
          <Slider
            slides={slides.map((s) => ({ image: s.image, title: s.title, text: s.text, cta: s.cta, href: s.href }))}
          />
        </section>

        {/* Les catégories, en cartes */}
        <section aria-label="Catégories" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-10">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categorie/${c.slug}`}
                  className="group block h-full overflow-hidden rounded-md border border-ink/10 bg-white transition-all hover:border-water/50 hover:shadow-lg"
                >
                  <span className="block aspect-[3/2] overflow-hidden bg-paper sm:aspect-[4/3]">
                    {c.image_url && (
                      <Pic
                        src={c.image_url}
                        alt={`${c.name} personnalisés`}
                        preset="category"
                        sizes="(min-width: 1024px) 16vw, (min-width: 768px) 31vw, 46vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </span>
                  <span className="block border-t-2 border-kraft px-3 py-3">
                    <span className="block font-body text-sm font-semibold leading-snug text-ink">{c.name}</span>
                    <span className="mt-1 block font-body text-xs font-semibold text-water">Voir en détails →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Un rayon par catégorie : quelques modèles, puis « Voir tout » */}
        {categories.map((c) => (
          <section key={c.id} className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-ink/10 pb-4">
              <div>
                <h2 className="font-display text-xl text-ink sm:text-2xl lg:text-3xl">
                  <Link href={`/categorie/${c.slug}`} className="hover:text-water">{c.name}</Link>
                </h2>
                <span className="mt-2 block h-1 w-14 rounded-full bg-kraft" />
              </div>
              <Link
                href={`/categorie/${c.slug}`}
                className="inline-block py-2 font-body text-sm font-semibold text-water hover:underline"
              >
                Voir en détails →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-4">
              {c.items.slice(0, 4).map((p, i) => (
                <div key={p.id ?? p.name} className={i >= 2 ? "hidden md:block" : ""}>
                  <ProductCard item={p} id={p.id ?? `${c.slug}-${i + 1}`} rules={rules} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <HowToOrder title={stepsHead.title} text={stepsHead.text} steps={steps.map((x) => ({ title: x.title, text: x.text }))} />
      </main>
      <Footer />
    </>
  );
}
