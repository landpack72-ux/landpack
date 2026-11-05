// Commande passée par un client CONNECTÉ : elle est enregistrée avec son identifiant de compte,
// pour apparaître dans « Mes commandes ». (Sans compte, le formulaire envoie directement à la base.)

import { json, sameOrigin } from "@/lib/admin-server";
import { orderLimiter, requireCustomer } from "@/lib/customer-server";
import { LOGO_PATH, clean, cleanPhone, cleanQuantity } from "@/lib/lead-clean";
import { consentLine } from "@/lib/legal";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const c = await requireCustomer();
  if (!c) return json({ error: "Session expirée." }, 401);
  if (orderLimiter.tooMany(c.user.id)) return json({ error: "Trop de commandes en peu de temps. Réessayez plus tard." }, 429);

  const b = await req.json().catch(() => null);
  if (!b || b.website) return json({ ok: true }); // champ piège

  if (b.consent !== true) return json({ error: "Cochez la case pour accepter la politique de confidentialité." }, 400);
  const phone = cleanPhone(b.phone);
  if (!phone) return json({ error: "Numéro de téléphone invalide." }, 400);
  const logoPath = typeof b.logo_path === "string" && LOGO_PATH.test(b.logo_path) ? b.logo_path : null;
  const photoPath = typeof b.photo_path === "string" && LOGO_PATH.test(b.photo_path) ? b.photo_path : null;

  orderLimiter.record(c.user.id);
  const row = {
    user_id: c.user.id,
    first_name: clean(b.first_name, 80),
    last_name: clean(b.last_name, 80),
    product: clean(b.product, 160),
    quantity: cleanQuantity(b.quantity),
    is_custom: b.is_custom === true,
    logo_path: logoPath,
    ...(photoPath ? { photo_path: photoPath } : {}),
    phone,
    address: clean(b.address, 300),
    message: [clean(b.message, 3800), consentLine()].filter(Boolean).join("\n\n"),
    source: (clean(b.source, 80) ?? "Commande"),
  };
  let { error } = await c.db.from("leads").insert(row);
  if (error && photoPath && /photo_path|schema cache|column/i.test(error.message)) {
    // La colonne photo n'existe pas encore : on garde la commande, la photo est notée dans le message.
    const { photo_path: _photo, ...rest } = row as typeof row & { photo_path?: string };
    void _photo;
    ({ error } = await c.db.from("leads").insert({ ...rest, message: `${rest.message ? rest.message + "\n\n" : ""}photo : ${photoPath}`.slice(0, 4000) }));
  }
  if (error) {
    console.error("[commande] refusée :", error.code ?? "", error.message);
    return json({ error: "L'enregistrement a échoué. Réessayez." }, 400);
  }
  return json({ ok: true });
}
