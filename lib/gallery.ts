// Galerie de photos d'un modèle : la photo principale (image_url) + jusqu'à 8 photos supplémentaires.

/** Nombre maximum de photos supplémentaires par modèle (la photo principale s'ajoute). */
export const MAX_GALLERY = 8;

/** Liste d'adresses d'images propre : textes valides, sans doublon, dans la limite autorisée. */
export function cleanGallery(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const u = x.trim();
    if (u.length === 0 || u.length > 700 || !/^(\/|https?:\/\/)/.test(u) || out.includes(u)) continue;
    out.push(u);
    if (out.length >= 12) break;
  }
  return out;
}

/** Toutes les photos à montrer sur la fiche : la principale en premier, puis la galerie. */
export function allImages(main: string | null | undefined, gallery: unknown): string[] {
  const list = cleanGallery(gallery);
  const first = main?.trim();
  return first ? [first, ...list.filter((u) => u !== first)] : list;
}
