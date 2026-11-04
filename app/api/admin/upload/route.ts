// Envoi d'une image (déjà convertie en WebP et adaptée par l'admin). Le serveur vérifie qu'il s'agit
// bien d'un fichier WebP, de taille raisonnable, avant de l'envoyer dans le stockage public.
// Une image comprend l'original adapté (xxx.webp) et deux versions légères pour le téléphone
// (xxx-md.webp, xxx-sm.webp) : celles-ci sont envoyées avec « variantOf » = nom de l'image principale.

import { randomBytes } from "node:crypto";
import { json, requireAdmin, sameOrigin } from "@/lib/admin-server";

const FOLDERS = new Set(["content", "products"]);
const MAX_BYTES = 2 * 1024 * 1024;
const BASE = /^\d{10,14}-[0-9a-f]{8}$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const admin = await requireAdmin();
  if (!admin) return json({ error: "Session expirée." }, 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");
  const variantOf = String(form?.get("variantOf") ?? "");
  const variant = String(form?.get("variant") ?? "");
  if (!(file instanceof File) || !FOLDERS.has(folder)) return json({ error: "Envoi invalide." }, 400);
  if (variantOf && (!BASE.test(variantOf) || !["md", "sm"].includes(variant))) return json({ error: "Envoi invalide." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Image trop lourde (2 Mo maximum)." }, 413);

  const buf = Buffer.from(await file.arrayBuffer());
  const isWebp = buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  if (!isWebp) return json({ error: "Seules les images WebP sont acceptées." }, 415);

  const name = variantOf ? `${variantOf}-${variant}` : `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const path = `${folder}/${name}.webp`;
  const { error } = await admin.db.storage
    .from("site-images")
    .upload(path, buf, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) return json({ error: error.message }, 400);

  return json({ url: admin.db.storage.from("site-images").getPublicUrl(path).data.publicUrl });
}
