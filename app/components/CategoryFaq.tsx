import { fmtInt, minQty, type PricingRules } from "@/lib/pricing";
import { hoursSentence } from "@/lib/shop";
import type { Product } from "@/lib/defaults";

// Questions fréquentes d'une catégorie : visibles par les clients et lues par Google. Chaque réponse
// reprend uniquement ce que le site affirme déjà (quantités et remise issues des réglages, livraison, boutique).
export default function CategoryFaq({
  name, items, rules, settings,
}: { name: string; items: Product[]; rules: PricingRules; settings: Record<string, string> }) {
  const active = items.filter((p) => p.is_active !== false);
  const min = active.length > 0 ? Math.min(...active.map((p) => minQty(p.min_qty, rules))) : rules.qtyMin;
  const hours = hoursSentence(settings);
  const landmarks = settings.shop_landmarks?.trim();

  const faq: { q: string; a: string }[] = [
    {
      q: `Peut-on personnaliser les ${name.toLowerCase()} avec son logo ?`,
      a: "Oui. Sur la fiche de chaque article, vous chargez votre logo. Avant l'impression, nous vous appelons pour valider le logo, la quantité, le prix et la livraison.",
    },
    {
      q: "Quelle est la quantité minimale ?",
      a: `À partir de ${fmtInt(min)} pièces selon le modèle, par paliers de ${fmtInt(rules.qtyStep)}.${
        rules.discountPercent > 0 && rules.discountThreshold > 0 ? ` Une remise de ${rules.discountPercent} % s'applique à l'ensemble de la commande dès ${fmtInt(rules.discountThreshold)} pièces.` : ""
      }`,
    },
    {
      q: "Comment commander ?",
      a: "Choisissez le modèle et la quantité, chargez votre logo, ajoutez l'article au panier puis envoyez votre commande. Vous pouvez aussi demander un devis ou nous écrire sur WhatsApp.",
    },
    {
      q: "Livrez-vous partout au Maroc ?",
      a: "Oui, nous livrons partout au Maroc. Vous pouvez aussi venir voir les produits à notre boutique de Sidi Maârouf, à Casablanca.",
    },
    {
      q: "Où se trouve la boutique ?",
      a: `${settings.address}.${landmarks ? ` ${landmarks}.` : ""}${hours ? ` ${hours}.` : ""}`,
    },
  ];

  return (
    <section className="mt-12 border-t border-ink/10 pt-8 sm:mt-16" aria-labelledby="faq-titre">
      <h2 id="faq-titre" className="font-display text-xl text-ink">Questions fréquentes</h2>
      <div className="mt-4 max-w-3xl divide-y divide-ink/10 rounded-md border border-ink/10 bg-white">
        {faq.map((x) => (
          <details key={x.q} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 font-body text-[15px] font-semibold text-ink">
              {x.q}
              <span aria-hidden className="shrink-0 text-ink-soft transition-transform group-open:rotate-180">▾</span>
            </summary>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
