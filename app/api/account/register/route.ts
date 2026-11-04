import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { emailFor, phoneDigits, profileOf, registerLimiter, validDigits, writeCustomerSession } from "@/lib/customer-server";
import { clean, cleanPhone } from "@/lib/lead-clean";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const ip = clientIp(req);
  if (registerLimiter.tooMany(ip)) return json({ error: "Trop de créations de compte depuis cette connexion. Réessayez plus tard." }, 429);

  const b = await req.json().catch(() => null);
  if (b?.website) return json({ ok: true }); // champ piège rempli : c'est un robot

  const first = clean(b?.first_name, 80);
  const last = clean(b?.last_name, 80);
  const phoneRaw = typeof b?.phone === "string" ? b.phone : "";
  const password = typeof b?.password === "string" ? b.password : "";
  const digits = phoneDigits(phoneRaw);

  if (!first || !last) return json({ error: "Indiquez votre prénom et votre nom." }, 400);
  if (!validDigits(digits)) return json({ error: "Numéro de téléphone invalide." }, 400);
  if (password.length < 8 || password.length > 72) return json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, 400);

  registerLimiter.record(ip);
  const anon = supabaseFor();
  if (!anon) return json({ error: "Configuration Supabase manquante." }, 500);

  const { data, error } = await anon.auth.signUp({
    email: emailFor(digits),
    password,
    options: { data: { first_name: first, last_name: last, phone: cleanPhone(phoneRaw) ?? digits, address: "" } },
  });

  if (error) {
    console.error("[compte] inscription refusée :", error.code ?? "", error.message);
    const m = error.message.toLowerCase();
    if (error.code === "user_already_exists" || m.includes("already") || m.includes("registered")) {
      return json({ error: "Un compte existe déjà avec ce numéro. Connectez-vous." }, 409);
    }
    if (error.code === "signup_disabled" || m.includes("signups not allowed") || m.includes("disabled")) {
      return json({ error: "La création de compte est désactivée pour le moment." }, 403);
    }
    return json({ error: "La création du compte a échoué. Réessayez, ou contactez-nous." }, 400);
  }
  if (!data.session || !data.user) {
    console.error("[compte] compte créé sans session : la confirmation par e-mail est activée dans Supabase");
    return json({ error: "Compte créé, mais il n'est pas encore activable (configuration en cours). Contactez-nous." }, 503);
  }

  await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, profile: profileOf(data.user) });
}
