// Vérification d'un lien reçu par e-mail (confirmation du compte ou mot de passe oublié).
//
// Pourquoi une page avec un bouton ? Beaucoup de messageries (Gmail, Outlook, antivirus…) ouvrent automatiquement
// les liens d'un e-mail pour les contrôler. Un lien « à usage unique » est alors consommé avant le client, qui voit
// « lien expiré ». Ici, ouvrir la page ne consomme rien : le lien n'est utilisé que lorsque le client CLIQUE sur le bouton.
import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { profileOf, writeCustomerSession } from "@/lib/customer-server";
import { makeLimiter } from "@/lib/rate-limit";

const limiter = makeLimiter(20, 15 * 60 * 1000);
const HASH = /^[A-Za-z0-9._-]{16,256}$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const ip = clientIp(req);
  if (limiter.tooMany(ip)) return json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, 429);

  const b = await req.json().catch(() => null);
  const tokenHash = typeof b?.token_hash === "string" ? b.token_hash : "";
  const type = b?.type;
  if (!HASH.test(tokenHash) || !["signup", "email", "recovery"].includes(type)) {
    return json({ error: "Ce lien n'est pas valable. Demandez un nouvel e-mail.", code: "invalid_link" }, 400);
  }
  limiter.record(ip);

  const anon = supabaseFor();
  if (!anon) return json({ error: "Le service de comptes n'est pas configuré." }, 500);

  const { data, error } = await anon.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error || !data.session || !data.user) {
    console.error("[compte] lien refusé :", error?.code ?? "", error?.status ?? "", error?.message ?? "");
    return json({ error: "Ce lien a expiré ou a déjà été utilisé. Demandez un nouvel e-mail depuis la page « Mon compte ».", code: "link_expired" }, 400);
  }

  if (type === "recovery") {
    // Mot de passe oublié : la session sert uniquement à choisir le nouveau mot de passe, juste après (gardée en mémoire par la page).
    return json({ ok: true, recovery: true, access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  }
  await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  return json({ ok: true, profile: profileOf(data.user) });
}
