// Envoi d'une commande ou d'une demande de devis vers la table « leads » de Supabase.
// Sécurité : la base n'accepte que l'AJOUT (règle RLS « leads envoi public »), les visiteurs
// ne peuvent rien lire. Les textes sont stockés tels quels et toujours affichés comme du texte
// (jamais comme du HTML) : un code saisi dans un formulaire reste inoffensif.
// Aucune adresse e-mail n'est demandée ni conservée.

import { getBrowserClient } from "./browser";
import { consentLine } from "./legal";
import { toWebp } from "./image-client";
import { LOGO_PATH, clean, cleanPhone, cleanQuantity } from "./lead-clean";

export type LeadInput = {
  firstName?: string;
  lastName?: string;
  product?: string;
  quantity?: number;
  isCustom?: boolean;
  /** Nom du fichier du logo déjà envoyé (voir uploadCustomerLogo). */
  logoPath?: string;
  /** Photo de l'article que le client possède (facultative), déjà envoyée. */
  photoPath?: string;
  phone: string;
  address?: string;
  message?: string;
  source: string;
  /** Champ piège invisible : rempli uniquement par des robots. */
  trap?: string;
  /** Le client a coché « J'ai lu et j'accepte la politique de confidentialité ». */
  consent?: boolean;
};

export type LeadResult = "ok" | "error" | "wait";

const WAIT_MS = 30_000;

/**
 * Envoie une image du client dans un stockage PRIVÉ (lisible uniquement par l'administrateur).
 * L'image est convertie en WebP dans le navigateur : fichier valide, léger, sans métadonnées.
 * Si le résultat dépasse 2 Mo (photo de téléphone), on réessaie avec une taille plus petite.
 */
async function uploadPrivateImage(file: File, quality: number, what: string): Promise<string> {
  if (file.size > 25 * 1024 * 1024) throw new Error(`Ce fichier est trop lourd (25 Mo maximum) : ${what}.`);
  let blob: Blob | null = null;
  try {
    for (const [width, q] of [[1600, quality], [1280, quality - 0.12], [1000, quality - 0.22]]) {
      const attempt = await toWebp(file, width, q);
      if (attempt.size <= 2 * 1024 * 1024) {
        blob = attempt;
        break;
      }
    }
  } catch {
    throw new Error(`Ce fichier n'a pas pu être lu (${what}). Utilisez une image PNG, JPG ou WebP.`);
  }
  if (!blob) throw new Error(`Ce fichier reste trop lourd (${what}). Essayez une image plus petite.`);

  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await getBrowserClient()
    .storage.from("customer-logos")
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(`L'envoi a échoué (${what}). Réessayez, ou envoyez-le-nous par WhatsApp.`);
  return path;
}

export const uploadCustomerLogo = (file: File) => uploadPrivateImage(file, 0.88, "logo");
export const uploadCustomerPhoto = (file: File) => uploadPrivateImage(file, 0.82, "photo de l'article");

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // Un robot a rempli le champ invisible : on fait semblant que tout va bien.
  if (input.trap) return "ok";
  if (input.consent !== true) return "error"; // sans acceptation de la politique de confidentialité, rien n'est enregistré

  const phone = cleanPhone(input.phone);
  if (!phone) return "error";

  const quantity = cleanQuantity(input.quantity);
  const logoPath = input.logoPath && LOGO_PATH.test(input.logoPath) ? input.logoPath : null;
  const photoPath = input.photoPath && LOGO_PATH.test(input.photoPath) ? input.photoPath : null;

  // Évite les doubles envois (clic répété) : une demande toutes les 30 secondes.
  try {
    const last = Number(localStorage.getItem("lp_last_lead") ?? 0);
    if (Date.now() - last < WAIT_MS) return "wait";
  } catch {
    /* stockage indisponible : on continue */
  }

  try {
    const client = getBrowserClient();
    const row = {
      first_name: clean(input.firstName, 80),
      last_name: clean(input.lastName, 80),
      product: clean(input.product, 160),
      quantity,
      is_custom: input.isCustom === true,
      logo_path: logoPath,
      // la colonne n'est envoyée que s'il y a une photo (les commandes sans photo marchent même avant la mise à jour SQL)
      ...(photoPath ? { photo_path: photoPath } : {}),
      phone,
      address: clean(input.address, 300),
      message: [clean(input.message, 3800), consentLine()].filter(Boolean).join("\n\n"),
      source: input.source.slice(0, 80),
    };
    let { error } = await client.from("leads").insert(row);
    if (error && photoPath && /photo_path|schema cache|column/i.test(error.message)) {
      // La colonne photo n'existe pas encore (landpack-photo.sql pas lancé) : on garde la commande, la photo est notée dans le message.
      const { photo_path: _photo, ...rest } = row as typeof row & { photo_path?: string };
      void _photo;
      ({ error } = await client.from("leads").insert({ ...rest, message: `${rest.message ? rest.message + "\n\n" : ""}photo : ${photoPath}`.slice(0, 4000) }));
    }
    if (error) return "error";
  } catch {
    return "error";
  }

  try {
    localStorage.setItem("lp_last_lead", String(Date.now()));
  } catch {
    /* ignoré */
  }
  return "ok";
}
