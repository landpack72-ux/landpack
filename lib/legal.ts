// Informations légales de l'entreprise (modifiables dans l'admin) et preuve de consentement.

/** Version des textes acceptés : à changer quand la politique de confidentialité change de façon importante. */
export const CONSENT_VERSION = "2026-11-05";
export const DEFAULT_LEGAL_UPDATED = "5 novembre 2026";

export type LegalField = { key: string; label: string; placeholder: string; required: boolean };

export const LEGAL_FIELDS: LegalField[] = [
  { key: "legal_name", label: "Raison sociale (nom légal de l'entreprise)", placeholder: "Ex. Landpack SARL", required: true },
  { key: "legal_form", label: "Forme juridique", placeholder: "SARL, SARL AU, auto-entrepreneur…", required: true },
  { key: "legal_ice", label: "ICE (Identifiant Commun de l'Entreprise)", placeholder: "15 chiffres", required: true },
  { key: "legal_rc", label: "Registre du commerce (numéro et ville)", placeholder: "Ex. RC 123456, Casablanca", required: true },
  { key: "legal_address", label: "Adresse du siège (vide : reprend l'adresse du site)", placeholder: "", required: false },
  { key: "legal_email", label: "E-mail pour les demandes sur les données personnelles (vide : e-mail public du site)", placeholder: "contact@landpack.ma", required: true },
  { key: "legal_publisher", label: "Directeur de la publication (nom et prénom)", placeholder: "", required: true },
  { key: "legal_cndp", label: "N° de déclaration ou d'autorisation CNDP (si vous en avez un)", placeholder: "", required: false },
  { key: "legal_data_region", label: "Pays ou région où sont hébergées les données (voir Supabase > Settings > General)", placeholder: "Ex. Union européenne (Francfort)", required: true },
  { key: "legal_retention_orders", label: "Durée de conservation des commandes", placeholder: "Ex. 10 ans (obligations comptables)", required: true },
  { key: "legal_updated", label: "Date de dernière mise à jour des textes", placeholder: DEFAULT_LEGAL_UPDATED, required: false },
];

/** Champs obligatoires encore vides (l'e-mail public et l'adresse du site servent de repli). */
export function legalMissing(s: Record<string, string>): LegalField[] {
  return LEGAL_FIELDS.filter((f) => {
    if (!f.required) return false;
    const v = (s[f.key] ?? "").trim();
    if (v) return false;
    if (f.key === "legal_email" && (s.email ?? "").trim()) return false;
    return true;
  });
}

/** Ligne ajoutée à chaque commande / demande : preuve que le client a accepté la politique de confidentialité. */
export function consentLine(now: Date = new Date()): string {
  return `Consentement à la politique de confidentialité (version ${CONSENT_VERSION}) : oui, le ${now.toISOString()}`;
}
export const CONSENT_LINE_RE = /^Consentement à la politique de confidentialité.*$/m;
