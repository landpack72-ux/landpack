// Règles de prix de Landpack : quantités par paliers, total de la commande, remise à partir d'un seuil.
// Ces fonctions sont utilisées par le site (affichage) ET par le serveur (calcul officiel à la commande).
// Les valeurs se modifient depuis l'admin (Catalogue > Tarifs et remises).

export type PricingRules = {
  qtyMin: number; // quantité minimale par défaut (ex. 50)
  qtyStep: number; // palier de quantité (ex. 50 : 50, 100, 150...)
  discountThreshold: number; // remise à partir de N pièces (ex. 1000)
  discountPercent: number; // pourcentage de remise (ex. 15)
};

const num = (v: unknown, fallback: number) => {
  const text = String(v ?? "").trim().replace(",", ".");
  if (text === "") return fallback; // champ vide : on garde la valeur d'origine
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function rulesFrom(settings: Record<string, string>): PricingRules {
  return {
    qtyMin: Math.max(1, Math.round(num(settings.qty_min, 50))),
    qtyStep: Math.max(1, Math.round(num(settings.qty_step, 50))),
    discountThreshold: Math.max(0, Math.round(num(settings.discount_threshold, 1000))),
    discountPercent: Math.min(90, num(settings.discount_percent, 15)),
  };
}

/** Quantité minimale d'un article : la sienne si elle est renseignée, sinon celle du site. */
export const minQty = (productMin: number | null | undefined, rules: PricingRules) =>
  productMin && productMin > 0 ? Math.round(productMin) : rules.qtyMin;

/** Une quantité est valable si elle atteint le minimum et tombe sur un palier (50, 100, 150...). */
export const isValidQty = (qty: number, min: number, step: number) =>
  Number.isInteger(qty) && qty >= min && (qty - min) % step === 0 && qty <= 1_000_000;

/** Ramène une quantité saisie au palier le plus proche (jamais en dessous du minimum). */
export function snapQty(qty: number, min: number, step: number): number {
  if (!Number.isFinite(qty) || qty < min) return min;
  return Math.min(1_000_000, min + Math.round((qty - min) / step) * step);
}

/** Quantités proposées en un clic : 50, 100, 250, 500, 1 000 (selon les réglages). */
export function quickQuantities(min: number, rules: PricingRules): number[] {
  const wanted = [min, min * 2, min * 5, min * 10, rules.discountThreshold > 0 ? rules.discountThreshold : min * 20];
  return Array.from(new Set(wanted)).filter((q) => isValidQty(q, min, rules.qtyStep)).sort((a, b) => a - b);
}

export type PricedLine = { unit_price: number | null; qty: number };

export type Totals = {
  pieces: number;
  subtotal: number; // avant remise
  discountPercent: number; // 0 si pas de remise
  discountAmount: number;
  total: number;
  unpriced: number; // nombre de lignes « sur devis » (sans prix) : non comptées dans le total
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Total d'une commande. La remise s'applique à toute la commande dès que le nombre total de pièces atteint le seuil. */
export function computeTotals(lines: PricedLine[], rules: PricingRules): Totals {
  const pieces = lines.reduce((n, l) => n + l.qty, 0);
  const priced = lines.filter((l) => l.unit_price != null);
  const subtotal = round2(priced.reduce((n, l) => n + (l.unit_price as number) * l.qty, 0));
  const discountPercent = rules.discountThreshold > 0 && rules.discountPercent > 0 && pieces >= rules.discountThreshold ? rules.discountPercent : 0;
  const discountAmount = round2((subtotal * discountPercent) / 100);
  return { pieces, subtotal, discountPercent, discountAmount, total: round2(subtotal - discountAmount), unpriced: lines.length - priced.length };
}

// L'espace fine insécable de « 1 000 » n'existe pas dans toutes les polices : on utilise l'espace insécable ordinaire.
const fix = (t: string) => t.replace(/\u202f/g, "\u00a0");
const nf = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ni = new Intl.NumberFormat("fr-FR");
export const fmtInt = (n: number) => fix(ni.format(n));
export const money = (n: number) => `${fix(nf.format(n))} Dh`;
export const piecesLabel = (n: number) => `${fmtInt(n)} pièce${n > 1 ? "s" : ""}`;
