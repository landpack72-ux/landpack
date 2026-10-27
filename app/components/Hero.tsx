import { getText } from "@/lib/data";
import StampBadge from "./StampBadge";

export default async function Hero() {
  const t = await getText("home.hero");
  return (
    <section
      id="top"
      className="relative h-[100dvh] max-h-[780px] min-h-[520px] w-full overflow-hidden bg-ink sm:h-[92dvh]"
    >
      <img
        src={t.image}
        alt={t.image_alt}
        className="photo-kraft-tone absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Overlays pour la lisibilité du texte, légers et teintés marque */}
      <div className="absolute inset-0 bg-gradient-to-t from-water-dark/60 via-ink/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/30 via-ink/5 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-10">
        <StampBadge rotate={-3} className="w-fit border-cream/60 !text-cream bg-ink/20">
          {t.badge}
        </StampBadge>

        <h1 className="mt-5 max-w-2xl bg-gradient-to-r from-cream via-cream to-gold bg-clip-text font-display text-3xl leading-[0.95] text-transparent drop-shadow-[0_3px_14px_rgba(15,30,38,0.55)] sm:text-5xl md:text-6xl lg:text-7xl">
          {t.title}
        </h1>

        <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-cream/90 drop-shadow-[0_2px_8px_rgba(15,30,38,0.5)] sm:mt-5 sm:text-base">
          {t.text}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
          <a
            href="#devis"
            className="rounded-full bg-water px-5 py-3 text-sm font-medium text-cream shadow-[0_8px_20px_-4px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-3.5 sm:text-base"
          >
            {t.cta1}
          </a>
          <a
            href="#produits"
            className="rounded-full border-2 border-cream/70 px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink sm:px-7 sm:py-3.5 sm:text-base"
          >
            {t.cta2}
          </a>
        </div>
      </div>
    </section>
  );
}
