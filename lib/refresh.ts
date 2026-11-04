// Met le site public à jour tout de suite après une modification dans l'admin :
// on vide les données en cache ET chaque type de page (accueil, catégories, articles, panier, plan du site).
import { revalidatePath, revalidateTag } from "next/cache";

export function refreshSite() {
  revalidateTag("landpack", { expire: 0 });
  revalidatePath("/", "layout");
  for (const [path, type] of [
    ["/", "page"],
    ["/categorie/[slug]", "page"],
    ["/produit/[id]", "page"],
    ["/devis", "page"],
    ["/panier", "page"],
    ["/sitemap.xml", undefined],
    ["/api/pricing", undefined],
  ] as const) {
    try {
      revalidatePath(path, type);
    } catch {
      /* un chemin inconnu ne doit jamais bloquer l'enregistrement */
    }
  }
}
