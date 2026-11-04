// Bouton « Actualiser le site » de l'admin : vide tous les caches du site public.
import { json, requireAdmin, sameOrigin } from "@/lib/admin-server";
import { refreshSite } from "@/lib/refresh";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  if (!(await requireAdmin())) return json({ error: "Session expirée." }, 401);
  refreshSite();
  return json({ ok: true });
}
