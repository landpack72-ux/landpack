import { json, requireAdmin } from "@/lib/admin-server";

export async function GET() {
  const admin = await requireAdmin();
  // 200 dans les deux cas : « pas connecté » est un état normal, pas une erreur.
  return json(admin ? { ok: true, email: admin.email } : { ok: false });
}
