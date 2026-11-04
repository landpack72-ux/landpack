import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { authFailure, cleanEmail, loginEmailLimiter, loginLimiter, profileOf, writeCustomerSession } from "@/lib/customer-server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const ip = clientIp(req);
  const b = await req.json().catch(() => null);
  const email = cleanEmail(b?.email);
  const password = typeof b?.password === "string" ? b.password : "";

  if (loginLimiter.tooMany(ip) || (email && loginEmailLimiter.tooMany(email))) {
    return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);
  }
  if (!email || !password || password.length > 72) return json({ error: "E-mail ou mot de passe incorrect." }, 400);

  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);

  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    const f = authFailure(error ?? { message: "invalid login credentials" });
    if (f.code === "invalid_credentials") {
      loginLimiter.record(ip);
      loginEmailLimiter.record(email);
    } else {
      console.error("[compte] connexion refusée :", error?.code ?? "", error?.status ?? "", error?.message ?? "");
    }
    return json({ error: f.message, code: f.code, needsConfirmation: f.code === "email_not_confirmed" }, f.status);
  }

  loginLimiter.clear(ip);
  loginEmailLimiter.clear(email);
  await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, profile: profileOf(data.user) });
}
