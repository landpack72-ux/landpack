import { getText } from "@/lib/data";

export default async function SubPageCta({ text = "Prêt à en discuter ?" }: { text?: string }) {
  const t = await getText("global.cta");
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border-2 border-ink/15 bg-water px-5 py-12 text-center shadow-[0_10px_30px_-8px_rgba(20,95,128,0.45)] sm:rounded-[2.5rem] sm:px-16 sm:py-16">
        <h2 className="break-words font-display text-2xl leading-[1.05] text-cream sm:text-4xl lg:text-5xl">
          {text}
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-cream/85">{t.text}</p>
        <a
          href="/#contact"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink sm:text-base"
        >
          {t.button}
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
