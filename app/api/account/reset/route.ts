// Choix d'un nouveau mot de passe après « Mot de passe oublié » : le jeton vient du lien reçu par e-mail.
import { json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { authFailure, passwordProblem, profileOf, writeCustomerSession } from "@/lib/customer-server";

const TOKEN = /^[A-Za-z0-9._-]{20,4000}$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const b = await req.json().catch(() => null);
  const access = typeof b?.access_token === "string" ? b.access_token : "";
  const refresh = typeof b?.refresh_token === "string" ? b.refresh_token : "";
  const password = typeof b?.password === "string" ? b.password : "";
  if (!TOKEN.test(access) || !TOKEN.test(refresh)) return json({ error: "Ce lien est invalide ou a expiré. Demandez un nouvel e-mail." }, 400);
  const weak = passwordProblem(password);
  if (weak) return json({ error: weak }, 400);

  const db = supabaseFor(access);
  const who = await db?.auth.getUser(access);
  if (!who || who.error || !who.data.user) return json({ error: "Ce lien est invalide ou a expiré. Demandez un nouvel e-mail." }, 400);

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  }).catch(() => null);
  if (!res || !res.ok) {
    const j = res ? await res.json().catch(() => ({})) : {};
    const f = authFailure({ code: j.error_code ?? j.code, message: j.msg ?? j.message ?? "error", status: res?.status });
    if (j.error_code === "same_password") return json({ error: "Choisissez un mot de passe différent de l'ancien." }, 400);
    console.error("[compte] nouveau mot de passe refusé :", j.error_code ?? "", j.msg ?? j.message ?? "");
    return json({ error: f.status === 500 ? "Le mot de passe n'a pas pu être changé. Redemandez un lien." : f.message }, f.status === 500 ? 400 : f.status);
  }

  await writeCustomerSession(access, refresh, 3600);
  return json({ ok: true, profile: profileOf(who.data.user) });
}
