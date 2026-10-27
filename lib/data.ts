// Lecture des données publiques du site (côté serveur).
// Si Supabase est injoignable ou vide, on retombe sur les valeurs par défaut :
// le site ne casse donc jamais.

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { DEF_BY_ID } from "./content";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, type Product } from "./defaults";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Les réponses sont gardées en cache 5 minutes, ou jusqu'à ce que l'admin
// enregistre un changement (voir app/api/revalidate/route.ts).
function db() {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: 300, tags: ["landpack"] } }),
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
    for (const row of data) if (row.value) out[row.key] = row.value;
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const client = db();
    if (!client) return DEFAULT_PRODUCTS;
    const { data, error } = await client
      .from("products")
      .select("id,name,description,image_url,price_label,is_active,sort_order")
      .order("sort_order")
      .order("created_at");
    if (error || !data?.length) return DEFAULT_PRODUCTS;
    return (data as Product[]).filter((p) => p.is_active);
  } catch {
    return DEFAULT_PRODUCTS;
  }
}
