import { json } from "@/lib/admin-server";
import { requireCustomer } from "@/lib/customer-server";

// Les commandes du client connecté : la base ne renvoie QUE les siennes (règle RLS).
export async function GET() {
  const c = await requireCustomer();
  if (!c) return json({ error: "Session expirée." }, 401);

  const base = "id,product,quantity,is_custom,is_handled,created_at,source";
  const read = (cols: string) => c.db.from("leads").select(cols).order("created_at", { ascending: false }).limit(50);
  let { data, error } = await read(base + ",total_amount");
  // Avant la mise à jour SQL du panier, la colonne total_amount n'existe pas encore.
  if (error) ({ data, error } = await read(base));
  if (error) return json({ error: "Impossible de lire vos commandes." }, 400);
  return json({ ok: true, orders: data ?? [] });
}
