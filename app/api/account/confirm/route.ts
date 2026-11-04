// Le lien de confirmation de l'e-mail ramène le client sur le site avec une session dans l'adresse (#access_token=…).
// Cette route vérifie ce jeton auprès de Supabase puis ouvre une session sécurisée (cookies HttpOnly).
import { json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { profileOf, writeCustomerSession } from "@/lib/customer-server";

const TOKEN = /^[A-Za-z0-9._-]{20,4000}$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const b = await req.json().catch(() => null);
  const access = typeof b?.access_token === "string" ? b.access_token : "";
  const refresh = typeof b?.refresh_token === "string" ? b.refresh_token : "";
  if (!TOKEN.test(access) || !TOKEN.test(refresh)) return json({ error: "Lien invalide ou expiré." }, 400);

  const db = supabaseFor(access);
  const { data, error } = (await db?.auth.getUser(access)) ?? { data: { user: null }, error: new Error("x") };
  if (error || !data.user) return json({ error: "Ce lien est invalide ou a expiré. Demandez un nouvel e-mail." }, 400);

  await writeCustomerSession(access, refresh, 3600);
  return json({ ok: true, profile: profileOf(data.user) });
}
