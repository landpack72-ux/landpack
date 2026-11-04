// Ouvre ou télécharge un fichier envoyé par un client (logo, photo de l'article) : stockage privé.
// L'administrateur reçoit un lien temporaire (2 minutes). Sans session administrateur valide, rien n'est accessible.
//   /api/admin/logo?path=<fichier>.webp                      -> affiche l'image (aperçu ou ouverture)
//   /api/admin/logo?path=<fichier>.webp&download=logo-client -> la télécharge sous ce nom

import { json, requireAdmin } from "@/lib/admin-server";

const PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;
const NAME = /^[A-Za-z0-9_-]{1,60}$/;

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return json({ error: "Session expirée." }, 401);

  const params = new URL(req.url).searchParams;
  const path = params.get("path") ?? "";
  if (!PATH.test(path)) return json({ error: "Fichier invalide." }, 400);

  const download = params.get("download");
  if (download && !NAME.test(download)) return json({ error: "Nom invalide." }, 400);

  const { data, error } = await admin.db.storage
    .from("customer-logos")
    .createSignedUrl(path, 120, download ? { download: `${download}.webp` } : undefined);
  if (error || !data?.signedUrl) return json({ error: "Fichier introuvable." }, 404);

  return Response.redirect(data.signedUrl, 302);
}
