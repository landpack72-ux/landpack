import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubPageHero from "../components/SubPageHero";
import SubPageCta from "../components/SubPageCta";
import StampBadge from "../components/StampBadge";
import { getList, getText } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/solutions-machines", await getText("seo.machines"), "/images/solu1.webp");
}

export default async function SolutionsMachinesPage() {
  const [hero, machHead, machines, consoHead, conso, smartHead, smart, closing, cta] = await Promise.all([
    getText("ma.hero"),
    getText("ma.machines_head"),
    getList("ma.machines"),
    getText("ma.conso_head"),
    getList("ma.conso"),
    getText("ma.smart_head"),
    getList("ma.smart"),
    getText("ma.closing"),
    getText("ma.cta"),
  ]);

  return (
    <>
      <Header />
      <main>
        <SubPageHero image={hero.image} eyebrow={hero.eyebrow} title={hero.title} text={hero.text} />

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              {machHead.badge}
            </StampBadge>
            <h2 className="mt-5 font-display text-4xl text-ink sm:text-5xl">{machHead.title}</h2>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {machines.map((s, i) => (
                <div key={s.title + i} className="rounded-2xl border-2 border-ink/10 bg-paper p-6">
                  <span className="font-mono text-xs text-water">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-2xl text-ink">{s.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cream/40 px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="stamp">
              {consoHead.badge}
            </StampBadge>
            <p className="mt-5 max-w-2xl font-body text-ink-soft">{consoHead.text}</p>

            <div className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {conso.map((s, i) => (
                <div key={s.title + i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <h3 className="font-display text-base text-ink">{s.title}</h3>
                    {s.text && <p className="mt-0.5 font-body text-sm text-ink-soft">{s.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <StampBadge rotate={-3} variant="ink">
              {smartHead.badge}
            </StampBadge>
            <p className="mt-5 max-w-2xl font-body text-ink-soft">{smartHead.text}</p>

            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {smart.map((s, i) => (
                <div key={s.title + i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <h3 className="font-display text-base text-ink">{s.title}</h3>
                    <p className="mt-0.5 font-body text-sm text-ink-soft">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border-2 border-ink/10 bg-water-dark p-6 sm:p-8">
              <p className="font-display text-lg text-cream sm:text-xl">{closing.title}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-wide text-cream/70">{closing.tags}</p>
              <p className="mt-3 font-body text-sm text-cream/85">{closing.text}</p>
            </div>
          </div>
        </section>

        <SubPageCta text={cta.title} />
      </main>
      <Footer />
    </>
  );
}
