import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { emailFor, loginLimiter, phoneDigits, profileOf, validDigits, writeCustomerSession } from "@/lib/customer-server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const ip = clientIp(req);
  if (loginLimiter.tooMany(ip)) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);

  const b = await req.json().catch(() => null);
  const digits = phoneDigits(typeof b?.phone === "string" ? b.phone : "");
  const password = typeof b?.password === "string" ? b.password : "";
  if (!validDigits(digits) || !password || password.length > 72) {
    return json({ error: "Numéro ou mot de passe incorrect." }, 400);
  }

  const anon = supabaseFor();
  if (!anon) return json({ error: "Configuration Supabase manquante." }, 500);

  const { data, error } = await anon.auth.signInWithPassword({ email: emailFor(digits), password });
  if (error || !data.session) {
    loginLimiter.record(ip);
    return json({ error: "Numéro ou mot de passe incorrect." }, 401);
  }

  loginLimiter.clear(ip);
  await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, profile: profileOf(data.user) });
}
