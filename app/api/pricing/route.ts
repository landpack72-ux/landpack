// Prix et règles du site, pour le panier (le serveur refait lui-même le calcul à la commande).
import { getCatalogue, getSettings } from "@/lib/data";
import { modelTitle } from "@/lib/defaults";
import { minQty, rulesFrom } from "@/lib/pricing";

// Toujours calculé à la demande (il lit les données déjà en cache du catalogue) : un prix modifié dans l'admin est visible tout de suite.
export const dynamic = "force-dynamic";

export async function GET() {
  const [categories, settings] = await Promise.all([getCatalogue(), getSettings()]);
  const rules = rulesFrom(settings);
  const products: Record<string, { unit_price: number | null; min_qty: number; title: string; category: string; slug: string }> = {};
  for (const c of categories) {
    for (const p of c.items) {
      if (p.id) products[p.id] = { unit_price: p.unit_price, min_qty: minQty(p.min_qty, rules), title: modelTitle(p), category: c.name, slug: c.slug };
    }
  }
  return Response.json({ rules, products }, { headers: { "Cache-Control": "no-store" } });
}
