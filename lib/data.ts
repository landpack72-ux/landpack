// Lecture des données publiques du site (côté serveur).
// Si Supabase est injoignable ou vide, on retombe sur les valeurs par défaut :
// le site ne casse donc jamais.

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { DEF_BY_ID } from "./content";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, defaultProducts, type Product } from "./defaults";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Les réponses sont gardées en cache 1 minute au plus, ou jusqu'à ce que l'admin
// enregistre un changement (voir app/api/admin/db/route.ts).
function db() {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: 60, tags: ["landpack"] } }),
    },
  });
}

type SectionRow = {
  id: string;
  section: string;
  sort_order: number;
  is_active: boolean;
  data: Record<string, string>;
};

// Une seule requête pour TOUTES les sections (la table est petite).
const allSections = cache(async (): Promise<SectionRow[] | null> => {
  try {
    const client = db();
    if (!client) return null;
    const { data, error } = await client
      .from("site_sections")
      .select("id,section,sort_order,is_active,data")
      .order("sort_order");
    return error ? null : ((data ?? []) as SectionRow[]);
  } catch {
    return null;
  }
});

async function rowsOf(id: string): Promise<SectionRow[]> {
  return ((await allSections()) ?? []).filter((r) => r.section === id);
}

/** Section « un seul bloc » : renvoie les champs (valeurs par défaut si rien en base). */
export async function getText(id: string): Promise<Record<string, string>> {
  const base = DEF_BY_ID[id].defaults[0] ?? {};
  const rows = await rowsOf(id);
  return rows.length ? { ...base, ...rows[0].data } : base;
}

/** Section « liste » : renvoie les éléments visibles, dans l'ordre. */
export async function getList(id: string): Promise<Record<string, string>[]> {
  const rows = await rowsOf(id);
  if (!rows.length) return DEF_BY_ID[id].defaults;
  return rows.filter((r) => r.is_active).map((r) => ({ ...r.data }));
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const client = db();
    if (!client) return DEFAULT_SETTINGS;
    const { data, error } = await client.from("site_settings").select("key,value");
    if (error || !data?.length) return DEFAULT_SETTINGS;
    const out = { ...DEFAULT_SETTINGS };
    // Une valeur vide enregistrée en base est respectée (ex. e-mail public volontairement masqué).
    for (const row of data) out[row.key] = row.value ?? "";
    if (!out.logo_url) out.logo_url = DEFAULT_SETTINGS.logo_url;
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export type CatalogueCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  items: Product[];
};

const fallbackCatalogue = (): CatalogueCategory[] =>
  DEFAULT_CATEGORIES.map((c) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image_url: c.image_url,
    items: defaultProducts().filter((p) => p.category_slug === c.slug),
  }));

export async function getCategory(slug: string): Promise<CatalogueCategory | null> {
  return (await getCatalogue()).find((c) => c.slug === slug) ?? null;
}

/** Un modèle (avec sa catégorie) à partir de son identifiant. */
export async function getProduct(id: string): Promise<{ product: Product & { id: string }; category: CatalogueCategory } | null> {
  for (const c of await getCatalogue()) {
    const p = c.items.find((x) => x.id === id);
    if (p) return { product: p as Product & { id: string }, category: c };
  }
  return null;
}

/** Catégories visibles, chacune avec ses modèles visibles (dans l'ordre choisi dans l'admin). */
export const getCatalogue = cache(async (): Promise<CatalogueCategory[]> => {
  try {
    const client = db();
    if (!client) return fallbackCatalogue();
    const [cats, prods] = await Promise.all([
      client.from("categories").select("id,slug,name,description,image_url,is_active,sort_order").order("sort_order"),
      client
        .from("products")
        .select("id,category_id,name,dimensions,description,image_url,unit_price,price_label,min_qty,custom_price_label,custom_min_qty,is_active,sort_order")
        .order("sort_order")
        .order("created_at"),
    ]);
    if (cats.error || prods.error || !cats.data?.length) return fallbackCatalogue();

    const products = ((prods.data ?? []) as Product[]).map((p) => ({ ...p, unit_price: p.unit_price == null ? null : Number(p.unit_price) }));
    return cats.data
      .filter((c) => c.is_active)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image_url: c.image_url,
        items: products.filter((p) => p.category_id === c.id && p.is_active),
      }))
      .filter((c) => c.items.length > 0);
  } catch {
    return fallbackCatalogue();
  }
});
