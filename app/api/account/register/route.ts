import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { authFailure, cleanEmail, originOf, passwordProblem, profileOf, registerLimiter, writeCustomerSession } from "@/lib/customer-server";
import { clean, cleanPhone } from "@/lib/lead-clean";

async function handle(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const ip = clientIp(req);
  if (registerLimiter.tooMany(ip)) return json({ error: "Trop de créations de compte depuis cette connexion. Réessayez plus tard." }, 429);

  const b = await req.json().catch(() => null);
  if (b?.website) return json({ ok: true }); // champ piège rempli : c'est un robot

  const first = clean(b?.first_name, 80);
  const last = clean(b?.last_name, 80);
  const email = cleanEmail(b?.email);
  const phone = cleanPhone(b?.phone);
  const password = typeof b?.password === "string" ? b.password : "";

  if (!first || !last) return json({ error: "Indiquez votre prénom et votre nom." }, 400);
  if (!email) return json({ error: "Indiquez une adresse e-mail valable." }, 400);
  if (!phone) return json({ error: "Indiquez un numéro de téléphone valable (pour la livraison)." }, 400);
  const weak = passwordProblem(password);
  if (weak) return json({ error: weak }, 400);

  registerLimiter.record(ip);
  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);

  const origin = originOf(req);
  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: first, last_name: last, phone, address: "" },
      ...(origin ? { emailRedirectTo: `${origin}/compte` } : {}),
    },
  });

  if (error) {
    const f = authFailure(error);
    console.error("[compte] inscription refusée :", error.code ?? "", error.status ?? "", error.message);
    return json({ error: f.message, code: f.code }, f.status);
  }

  // Supabase renvoie un utilisateur « fantôme » (sans identité) quand l'adresse existe déjà
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return json({ error: "Un compte existe déjà avec cet e-mail. Connectez-vous, ou utilisez « Mot de passe oublié ».", code: "user_already_exists" }, 409);
  }

  // Confirmation par e-mail activée dans Supabase : le compte attend le clic sur le lien reçu
  if (!data.session || !data.user) return json({ ok: true, needsConfirmation: true });

  await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, profile: profileOf(data.user) });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("[compte] incident imprévu (%s) :", "register", e instanceof Error ? e.message : e);
    return json({ error: "Une erreur technique est survenue. Réessayez dans un instant ou contactez-nous.", code: "server_error" }, 500);
  }
}
