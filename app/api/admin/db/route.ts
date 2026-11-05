// Toutes les lectures et écritures de l'admin passent par ici.
// Chaque requête : origine vérifiée, session admin vérifiée, table et colonnes contrôlées.
// Les règles RLS de Supabase restent la dernière barrière (elles s'appliquent à l'utilisateur connecté).

import { json, requireAdmin, sameOrigin } from "@/lib/admin-server";
import { leadFilePaths } from "@/lib/lead-files";
import { refreshSite } from "@/lib/refresh";

const TABLES = new Set(["site_sections", "categories", "products", "site_settings", "leads"]);
const PUBLIC_TABLES = new Set(["site_sections", "categories", "products", "site_settings"]); // visibles sur le site
const ACTIONS = new Set(["select", "insert", "update", "upsert", "delete"]);
const IDENT = /^[a-z_][a-z0-9_]*$/;
const SELECT = /^[a-zA-Z0-9_,*\s]{1,300}$/;
const MAX_BODY = 1_000_000;

type Body = {
  table?: string;
  action?: string;
  select?: string;
  count?: string;
  head?: boolean;
  values?: unknown;
  onConflict?: string;
  filters?: { column?: string; value?: unknown }[];
  order?: { column?: string; ascending?: boolean }[];
  limit?: number;
};

const isRow = (v: unknown) => typeof v === "object" && v !== null && !Array.isArray(v);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const admin = await requireAdmin();
  if (!admin) return json({ error: "Session expirée." }, 401);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "Requête trop volumineuse." }, 413);
  let b: Body;
  try {
    b = JSON.parse(raw);
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }

  const { table, action } = b;
  if (!table || !TABLES.has(table) || !action || !ACTIONS.has(action)) {
    return json({ error: "Opération non autorisée." }, 400);
  }

  const filters = (b.filters ?? []).filter((f) => f && typeof f.column === "string" && IDENT.test(f.column));
  const order = (b.order ?? []).filter((o) => o && typeof o.column === "string" && IDENT.test(o.column));
  if ((action === "update" || action === "delete") && filters.length === 0) {
    return json({ error: "Une modification ou suppression doit cibler une ligne." }, 400);
  }
  if (b.onConflict && !IDENT.test(b.onConflict)) return json({ error: "Requête invalide." }, 400);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = admin.db.from(table);
  if (action === "select") {
    if (b.select && !SELECT.test(b.select)) return json({ error: "Requête invalide." }, 400);
    q = q.select(b.select ?? "*", { count: b.count === "exact" ? "exact" : undefined, head: b.head === true });
  } else if (action === "delete") {
    q = q.delete();
  } else {
    const ok = Array.isArray(b.values) ? b.values.length > 0 && b.values.every(isRow) : isRow(b.values);
    if (!ok) return json({ error: "Données invalides." }, 400);
    if (action === "insert") q = q.insert(b.values);
    else if (action === "update") q = q.update(b.values);
    else q = q.upsert(b.values, { onConflict: b.onConflict });
  }

  for (const f of filters) q = q.eq(f.column, f.value);
  for (const o of order) q = q.order(o.column, { ascending: o.ascending !== false });
  if (typeof b.limit === "number" && b.limit > 0 && b.limit <= 1000) q = q.limit(b.limit);

  // Supprimer une demande supprime aussi ses logos et photos du stockage privé (la politique de confidentialité le promet).
  // On lit les chemins AVANT de supprimer ; les fichiers ne sont effacés que si la suppression de la demande a réussi.
  let filePaths: string[] = [];
  if (action === "delete" && table === "leads") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sel: any = admin.db.from("leads").select("*");
    for (const f of filters) sel = sel.eq(f.column, f.value);
    const { data: rows } = await sel;
    filePaths = ((rows ?? []) as Parameters<typeof leadFilePaths>[0][]).flatMap(leadFilePaths);
  }

  const { data, error, count } = await q;

  if (!error && filePaths.length > 0) {
    const { error: rmError } = await admin.db.storage.from("customer-logos").remove(filePaths);
    if (rmError) console.error("[admin] fichiers non supprimés :", rmError.message);
  }

  // Une modification du contenu public met le site à jour tout de suite.
  if (!error && action !== "select" && PUBLIC_TABLES.has(table)) {
    refreshSite();
  }

  return json({ data: data ?? null, error: error ? { message: error.message } : null, count: count ?? null });
}
