import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubPageHero from "../components/SubPageHero";
import SubPageCta from "../components/SubPageCta";
import ShowcaseGallery from "../components/ShowcaseGallery";
import StampBadge from "../components/StampBadge";
import { getList, getText } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/sur-mesure", await getText("seo.surmesure"), "/images/surmesure1.webp");
}

export default async function SurMesurePage() {
  const [hero, showHead, showcase, stepsHead, steps, cta] = await Promise.all([
    getText("sm.hero"),
    getText("sm.showcase_head"),
    getList("sm.showcase"),
    getText("sm.steps_head"),
    getList("sm.steps"),
    getText("sm.cta"),
  ]);

  return (
    <>
      <Header />
      <main>
        <SubPageHero image={hero.image} eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              {showHead.badge}
            </StampBadge>
            <h2 className="mt-5 font-display text-3xl text-ink sm:text-4xl lg:text-5xl">{showHead.title}</h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">{showHead.text}</p>
            <div className="mt-10">
              <ShowcaseGallery
                images={showcase.map((x) => ({ src: x.image, alt: x.alt, caption: x.caption }))}
                tone="soft"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              {stepsHead.badge}
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
              {stepsHead.title}
            </h2>
            <p className="mt-4 max-w-lg font-body text-ink-soft">{stepsHead.text}</p>

            <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px border-t-2 border-dashed border-ink/15 sm:block"
              />
              {steps.map((s, i) => (
                <div key={s.title + i} className="relative">
                  <span className="font-display text-5xl text-water">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-body text-lg font-medium text-ink">{s.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SubPageCta text={cta.title} />
      </main>
      <Footer />
    </>
  );
}
