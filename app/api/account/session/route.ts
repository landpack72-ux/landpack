import { json } from "@/lib/admin-server";
import { profileOf, requireCustomer } from "@/lib/customer-server";

export async function GET() {
  const c = await requireCustomer();
  // 200 dans les deux cas : « pas connecté » est un état normal, pas une erreur.
  return json(c ? { ok: true, profile: profileOf(c.user) } : { ok: false });
}
