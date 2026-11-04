import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { cleanEmail, mailLimiter, originOf } from "@/lib/customer-server";

// « Mot de passe oublié » : envoie un lien de réinitialisation. La réponse est la même que l'adresse existe ou non
// (on ne révèle jamais quelles adresses ont un compte).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const b = await req.json().catch(() => null);
  const email = cleanEmail(b?.email);
  if (!email) return json({ error: "Indiquez une adresse e-mail valable." }, 400);

  const key = `${clientIp(req)}|${email}`;
  if (mailLimiter.tooMany(key)) return json({ error: "Trop de demandes. Réessayez dans une heure." }, 429);
  mailLimiter.record(key);

  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);
  const origin = originOf(req);
  const { error } = await anon.auth.resetPasswordForEmail(email, origin ? { redirectTo: `${origin}/compte/nouveau-mot-de-passe` } : undefined);
  if (error) console.error("[compte] réinitialisation refusée :", error.code ?? "", error.status ?? "", error.message);
  return json({ ok: true });
}
