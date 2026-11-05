// Retrouve tous les fichiers privés (logos, photos) attachés à une demande : colonnes dédiées, lignes du panier,
// ou chemins écrits dans le message (demandes anciennes). Utilisé pour les effacer avec la demande.

const UUID_WEBP = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp/gi;
const ONE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;

type Row = {
  logo_path?: string | null;
  photo_path?: string | null;
  message?: string | null;
  items?: { logo_path?: string | null; photo_path?: string | null }[] | null;
};

export function leadFilePaths(row: Row): string[] {
  const out = new Set<string>();
  const add = (p: unknown) => {
    if (typeof p === "string" && ONE.test(p)) out.add(p);
  };
  add(row.logo_path);
  add(row.photo_path);
  for (const it of Array.isArray(row.items) ? row.items : []) {
    add(it?.logo_path);
    add(it?.photo_path);
  }
  for (const m of (row.message ?? "").matchAll(UUID_WEBP)) add(m[0]);
  return [...out];
}
