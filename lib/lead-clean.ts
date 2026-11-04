// Nettoyage des champs d'une commande (identique dans le navigateur et sur le serveur).

// Retire les caractères de contrôle et limite la longueur.
export function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
  return v || null;
}

// Un numéro ne contient que des chiffres, +, espaces, tirets, points et parenthèses.
export function cleanPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.replace(/[^\d+()\-.\s]/g, "").trim().slice(0, 40);
  return v.replace(/\D/g, "").length >= 6 ? v : null;
}

export function cleanQuantity(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.min(1_000_000, Math.max(1, Math.floor(n))) : null;
}

export const LOGO_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;
