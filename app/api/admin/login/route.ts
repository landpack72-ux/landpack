import { clearFailures, clientIp, json, recordFailure, sameOrigin, supabaseFor, tooManyAttempts, writeSession } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const ip = clientIp(req);
  if (tooManyAttempts(ip)) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password || email.length > 254 || password.length > 200) {
    return json({ error: "E-mail ou mot de passe incorrect." }, 400);
  }

  const anon = supabaseFor();
  if (!anon) return json({ error: "Configuration Supabase manquante." }, 500);

  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    recordFailure(ip);
    return json({ error: "E-mail ou mot de passe incorrect." }, 401);
  }

  // Le compte doit être administrateur : sinon aucune session n'est créée.
  const { data: isAdmin } = await supabaseFor(data.session.access_token)!.rpc("is_admin");
  if (isAdmin !== true) {
    recordFailure(ip);
    return json({ error: "E-mail ou mot de passe incorrect." }, 401);
  }

  clearFailures(ip);
  await writeSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, email: data.user.email ?? "" });
}
