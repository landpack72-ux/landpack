import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { loginEmailLimiter, passwordProblem, requireCustomer, writeCustomerSession } from "@/lib/customer-server";

// Changement de mot de passe d'un client connecté : l'ancien mot de passe est redemandé et vérifié.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const c = await requireCustomer();
  if (!c || !c.user.email) return json({ error: "Session expirée." }, 401);

  const b = await req.json().catch(() => null);
  const current = typeof b?.current === "string" ? b.current : "";
  const next = typeof b?.next === "string" ? b.next : "";
  const weak = passwordProblem(next);
  if (weak) return json({ error: weak }, 400);
  if (next === current) return json({ error: "Choisissez un mot de passe différent de l'ancien." }, 400);

  const key = `pwd|${c.user.email}`;
  if (loginEmailLimiter.tooMany(key)) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);
  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);
  void clientIp;
  const check = await anon.auth.signInWithPassword({ email: c.user.email, password: current });
  if (check.error || !check.data.session) {
    loginEmailLimiter.record(key);
    return json({ error: "Votre mot de passe actuel est incorrect." }, 401);
  }
  loginEmailLimiter.clear(key);

  // Supabase (« Secure password change ») n'accepte le changement qu'avec une session RÉCENTE : on utilise donc
  // la session toute neuve créée par la vérification de l'ancien mot de passe, pas l'ancienne session du cookie.
  const fresh = check.data.session;
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${fresh.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password: next }),
  }).catch(() => null);
  if (!res || !res.ok) {
    const j = res ? await res.json().catch(() => ({})) : {};
    console.error("[compte] changement de mot de passe refusé :", j.error_code ?? res?.status ?? "", j.msg ?? j.message ?? "");
    if (j.error_code === "same_password") return json({ error: "Choisissez un mot de passe différent de l'ancien." }, 400);
    if (j.error_code === "weak_password") return json({ error: "Ce mot de passe est trop faible ou trop courant. Choisissez-en un plus long, avec lettres et chiffres." }, 400);
    return json({ error: "Le mot de passe n'a pas pu être changé. Réessayez, ou utilisez « Mot de passe oublié »." }, 400);
  }
  await writeCustomerSession(fresh.access_token, fresh.refresh_token, fresh.expires_in); // le client reste connecté avec la session récente
  return json({ ok: true });
}
