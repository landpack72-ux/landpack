import { getList, getText } from "@/lib/data";
import StampBadge from "./StampBadge";

function tagsOf(tags: string | undefined): string[] {
  return (tags ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

export default async function Products() {
  const [head, cards] = await Promise.all([getText("home.offers_head"), getList("home.offers")]);
  return (
    <section id="produits" className="px-4 sm:px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <StampBadge rotate={-3} variant="ink">
          {head.badge}
        </StampBadge>
        <h2 className="mt-5 break-words font-display text-3xl text-ink sm:text-5xl lg:text-6xl">
          {head.title}
        </h2>
        <p className="mt-4 max-w-lg font-body text-ink-soft">
          {head.text}
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title + c.href}
              className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink/10 bg-paper transition-shadow hover:shadow-[6px_6px_0_0_rgba(23,36,43,0.12)]"
            >
              <a href={c.href} className="relative block h-52 overflow-hidden">
                <img
                  src={c.image}
                  alt={`${c.title} Landpack`}
                  className="photo-kraft-tone h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </a>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl text-ink">
                  <a href={c.href} className="hover:text-water-dark">
                    {c.title}
                  </a>
                </h3>
                <p className="mt-2 font-body text-sm text-ink-soft">{c.tagline}</p>

                {tagsOf(c.tags).length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {tagsOf(c.tags).map((label) => (
                      <li
                        key={label}
                        className="rounded-full border border-ink/15 bg-cream px-3 py-1 font-mono text-[10px] uppercase text-ink-soft"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={c.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-water transition-colors hover:text-water-dark"
                >
                  {c.cta}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
