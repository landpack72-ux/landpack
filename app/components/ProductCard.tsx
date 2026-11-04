import Link from "next/link";
import Pic from "./Pic";
import { modelTitle, type Product } from "@/lib/defaults";
import { minQty, money, type PricingRules } from "@/lib/pricing";

// Carte d'un modèle, dans le style d'une boutique en ligne : grande photo, titre, quantité minimale, bouton.
export default function ProductCard({ item, id, rules }: { item: Product; id: string; rules: PricingRules }) {
  const href = `/produit/${id}`;
  const title = modelTitle(item);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden rounded-md border border-ink/10 bg-white transition-colors group-hover:border-water/50"
      >
        <span className="absolute left-2 top-2 z-10 rounded bg-kraft px-2 py-0.5 font-body text-[11px] font-semibold text-ink">
          Personnalisable
        </span>
        {item.image_url && (
          <Pic
            src={item.image_url}
            alt={`${title} personnalisable`}
            preset="product"
            sizes="(min-width: 1280px) 290px, (min-width: 768px) 31vw, 46vw"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="font-body text-sm font-semibold leading-snug text-ink">
          <Link href={href} className="hover:text-water">
            {title}
          </Link>
        </h3>
        <p className="mt-1 font-body text-sm font-bold text-ink">
          {item.unit_price != null ? (
            <>
              {money(item.unit_price)} <span className="text-xs font-medium text-ink-soft">/ pièce</span>
            </>
          ) : (
            <span className="text-xs font-medium text-ink-soft">Prix sur devis</span>
          )}
        </p>
        <p className="font-body text-xs font-semibold text-water">Min. {minQty(item.min_qty, rules)} pièces</p>
        <Link
          href={href}
          className="mt-3 block rounded bg-water px-4 py-2.5 text-center sm:inline-block sm:self-start sm:py-2 font-body text-sm font-semibold text-cream transition-colors hover:bg-water-dark"
        >
          Voir l&apos;article
        </Link>
      </div>
    </article>
  );
}
