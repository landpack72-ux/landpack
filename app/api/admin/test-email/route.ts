// Diagnostic d'envoi d'e-mails : demande à Supabase d'envoyer un e-mail de réinitialisation à l'adresse de
// l'administrateur et rapporte le résultat EXACT (durée, code et message d'erreur éventuels).
import { json, requireAdmin, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { makeLimiter } from "@/lib/rate-limit";

const limiter = makeLimiter(6, 60 * 60 * 1000);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const admin = await requireAdmin();
  if (!admin) return json({ error: "Session expirée." }, 401);
  const email = admin.email;
  if (!email) return json({ error: "Votre compte n'a pas d'adresse e-mail." }, 400);

  if (limiter.tooMany(email)) return json({ error: "Trop d'essais : 6 par heure maximum." }, 429);
  limiter.record(email);

  const anon = supabaseFor();
  if (!anon) return json({ error: "Configuration Supabase manquante." }, 500);
  const origin = req.headers.get("origin");
  const t0 = Date.now();
  const { error } = await anon.auth.resetPasswordForEmail(email, origin ? { redirectTo: `${origin}/compte/verification` } : undefined);
  const ms = Date.now() - t0;
  if (!error) return json({ ok: true, email, ms });
  return json({ ok: false, email, ms, status: error.status ?? null, code: error.code ?? null, message: error.message });
}
