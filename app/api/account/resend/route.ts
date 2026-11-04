import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { authFailure, cleanEmail, mailLimiter, originOf } from "@/lib/customer-server";

// Renvoie l'e-mail de confirmation (limité : 4 par heure et par adresse).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const b = await req.json().catch(() => null);
  const email = cleanEmail(b?.email);
  if (!email) return json({ error: "Indiquez votre adresse e-mail." }, 400);

  const key = `${clientIp(req)}|${email}`;
  if (mailLimiter.tooMany(key)) return json({ error: "Trop de demandes. Réessayez dans une heure." }, 429);
  mailLimiter.record(key);

  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);
  const origin = originOf(req);
  const { error } = await anon.auth.resend({ type: "signup", email, ...(origin ? { options: { emailRedirectTo: `${origin}/compte` } } : {}) });
  if (error) {
    console.error("[compte] renvoi refusé :", error.code ?? "", error.message);
    const f = authFailure(error);
    if (f.status !== 500) return json({ error: f.message, code: f.code }, f.status);
  }
  return json({ ok: true }); // même réponse que l'adresse existe ou non
}
