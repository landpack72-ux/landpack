import { getList, getText } from "@/lib/data";
import StampBadge from "./StampBadge";

export default async function AdviceSection() {
  const [t, points] = await Promise.all([getText("home.advice"), getList("home.advice_points")]);
  return (
    <section
      id="conseils"
      className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border-2 border-ink/10 bg-water-dark sm:rounded-[1.75rem]">
        <div className="grid gap-8 p-6 sm:gap-10 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-16">
          <div className="min-w-0">
            <StampBadge rotate={-3} className="border-cream/50 !text-cream">
              {t.badge}
            </StampBadge>
            <h2 className="mt-5 break-words font-display text-2xl leading-[1.1] text-cream sm:text-4xl lg:text-5xl">
              {t.title}
            </h2>
            <p className="mt-4 max-w-md font-body text-sm text-cream/85 sm:text-base">
              {t.text}
            </p>

            <ul className="mt-6 space-y-3 sm:mt-7">
              {points.map((p) => (
                <li key={p.text} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="font-body text-sm text-cream/90">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 rounded-2xl border border-cream/20 bg-cream/10 p-5 backdrop-blur-sm sm:p-9">
            <p className="break-words font-display text-lg leading-snug text-cream sm:text-2xl">
              {t.card_title}
            </p>
            <p className="mt-3 font-body text-sm text-cream/80">
              {t.card_text}
            </p>
            <a
              href="/#contact"
              className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              {t.card_cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
