import { consentLine } from "@/lib/legal";
// Validation du panier. Le SERVEUR recalcule tout (prix, quantités, remise) à partir du catalogue :
// un visiteur ne peut donc pas modifier un prix en trafiquant sa requête. La commande est enregistrée
// dans la table « leads » ; si le client est connecté, elle est liée à son compte.

import { clientIp, json, sameOrigin, supabaseFor } from "@/lib/admin-server";
import { requireCustomer } from "@/lib/customer-server";
import { getCatalogue, getSettings } from "@/lib/data";
import { modelTitle, type Product } from "@/lib/defaults";
import { LOGO_PATH, clean, cleanPhone } from "@/lib/lead-clean";
import { computeTotals, isValidQty, minQty, money, rulesFrom } from "@/lib/pricing";
import { makeLimiter } from "@/lib/rate-limit";

const limiter = makeLimiter(10, 60 * 60 * 1000);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const ip = clientIp(req);
  if (limiter.tooMany(ip)) return json({ error: "Trop de commandes en peu de temps. Réessayez plus tard." }, 429);

  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return json({ error: "Requête invalide." }, 400);
  if (b.website) return json({ ok: true }); // champ piège rempli : robot

  if (b.consent !== true) return json({ error: "Cochez la case pour accepter la politique de confidentialité." }, 400);
  const phone = cleanPhone(b.phone);
  const first = clean(b.first_name, 80);
  const last = clean(b.last_name, 80);
  const address = clean(b.address, 300);
  if (!phone || !first || !last || !address) return json({ error: "Vérifiez votre nom, votre téléphone et votre adresse." }, 400);

  const rawItems: unknown[] = Array.isArray(b.items) ? b.items : [];
  if (rawItems.length < 1 || rawItems.length > 30) return json({ error: "Votre panier est vide ou trop long." }, 400);

  // Catalogue et règles lus côté serveur
  const [categories, settings] = await Promise.all([getCatalogue(), getSettings()]);
  const rules = rulesFrom(settings);
  const index = new Map<string, { p: Product; category: string }>();
  for (const c of categories) for (const p of c.items) if (p.id) index.set(p.id, { p, category: c.name });

  const items = [];
  for (const raw of rawItems) {
    const r = raw as Record<string, unknown>;
    const found = index.get(String(r.id ?? ""));
    if (!found) return json({ error: "Un article de votre panier n'est plus disponible. Retirez-le puis réessayez." }, 400);
    const title = modelTitle(found.p);
    const qty = Number(r.qty);
    if (!isValidQty(qty, minQty(found.p.min_qty, rules), rules.qtyStep)) {
      return json({ error: `Quantité invalide pour « ${title} » (minimum ${minQty(found.p.min_qty, rules)}, par paliers de ${rules.qtyStep}).` }, 400);
    }
    const logo = typeof r.logo_path === "string" && LOGO_PATH.test(r.logo_path) ? r.logo_path : null;
    if (!logo) return json({ error: `Le logo de « ${title} » est manquant : retirez l'article et ajoutez-le de nouveau.` }, 400);
    const photo = typeof r.photo_path === "string" && LOGO_PATH.test(r.photo_path) ? r.photo_path : null;
    const unit = found.p.unit_price;
    items.push({
      id: found.p.id as string,
      title,
      category: found.category,
      unit_price: unit,
      qty,
      line_total: unit != null ? Math.round(unit * qty * 100) / 100 : null,
      logo_path: logo,
      photo_path: photo,
      note: clean(r.note, 500),
    });
  }

  const totals = computeTotals(items.map((i) => ({ unit_price: i.unit_price, qty: i.qty })), rules);
  const summary = items.length === 1 ? items[0].title : `${items.length} articles : ${items[0].title} et ${items.length - 1} autre${items.length > 2 ? "s" : ""}`;
  // Le message du client est suivi de la preuve de son consentement (date et version du texte accepté).
  const message = [clean(b.message, 1500), consentLine()].filter(Boolean).join("\n\n");

  // Qui commande ? Un client connecté (commande liée à son compte) ou un visiteur.
  const customer = await requireCustomer();
  const db = customer ? customer.db : supabaseFor();
  if (!db) return json({ error: "Configuration Supabase manquante." }, 500);

  limiter.record(ip);
  const base = {
    ...(customer ? { user_id: customer.user.id } : {}),
    first_name: first,
    last_name: last,
    phone,
    address,
    source: "Panier",
    is_custom: true,
    product: summary.slice(0, 160),
    quantity: Math.min(1_000_000, totals.pieces),
    logo_path: items[0].logo_path,
    ...(items[0].photo_path ? { photo_path: items[0].photo_path } : {}),
  };
  const full = {
    ...base,
    message,
    items,
    total_amount: totals.total,
    discount_percent: totals.discountPercent,
  };

  // On essaie d'abord l'enregistrement complet. Si une mise à jour SQL n'est pas encore faite (colonne absente),
  // on n'abandonne JAMAIS la commande : le détail (fichiers compris) est alors écrit dans le message,
  // et l'admin retrouve les fichiers à partir de ce texte.
  const detail = items.map((i) => `- ${i.title} × ${i.qty}${i.unit_price != null ? ` à ${money(i.unit_price)}` : " (sur devis)"} | logo : ${i.logo_path}${i.photo_path ? ` | photo : ${i.photo_path}` : ""}`).join("\n");
  const text = `COMMANDE PANIER\n${detail}\nTotal : ${money(totals.total)}${totals.discountPercent ? ` (remise ${totals.discountPercent} %)` : ""}${message ? `\n\n${message}` : ""}`.slice(0, 4000);
  const { photo_path: firstPhoto, ...withoutPhoto } = base as typeof base & { photo_path?: string };
  const attempts: Record<string, unknown>[] = [
    full, // 1. tout : articles, total, remise, photo
    { ...base, message: text }, // 2. sans les colonnes du panier (landpack-panier.sql pas encore lancé), photo gardée
    { ...withoutPhoto, message: text }, // 3. sans la colonne photo non plus (landpack-photo.sql pas encore lancé)
  ];
  void firstPhoto;
  let error: { code?: string; message: string } | null = null;
  for (const row of attempts) {
    ({ error } = await db.from("leads").insert(row));
    if (!error || !/items|total_amount|discount_percent|photo_path|schema cache|column/i.test(error.message)) break;
  }
  if (error) {
    console.error("[panier] commande refusée :", error.code ?? "", error.message);
    return json({ error: "L'enregistrement a échoué. Réessayez, ou contactez-nous." }, 400);
  }

  return json({ ok: true, total: totals.total, pieces: totals.pieces, discountPercent: totals.discountPercent, articles: items.length });
}
