// Diagnostic : lit la configuration publique de l'authentification de Supabase (inscriptions, confirmation e-mail)
// pour dire à l'administrateur, en français, ce qui empêche éventuellement les clients de créer un compte.
import { json, requireAdmin } from "@/lib/admin-server";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "Session expirée." }, 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return json({ ok: false, error: "Les variables Supabase ne sont pas définies sur le site." });

  const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return json({ ok: false, error: "Impossible de lire la configuration de Supabase (adresse ou clé incorrecte ?)." });
  const s = await res.json().catch(() => null);
  if (!s) return json({ ok: false, error: "Réponse inattendue de Supabase." });

  return json({
    ok: true,
    signupAllowed: s.disable_signup === false,
    emailEnabled: s.external?.email !== false,
    autoconfirm: s.mailer_autoconfirm === true,
  });
}
