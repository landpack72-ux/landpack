// Lecture des données publiques du site (côté serveur).
// Si Supabase est injoignable ou vide, on retombe sur les valeurs par défaut :
// le site ne casse donc jamais.

import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_BLOCKS,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  type Block,
  type Product,
} from "./defaults";

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
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at");
    if (error || !data?.length) return DEFAULT_PRODUCTS;
    return data as Product[];
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function getBlocks(section: string): Promise<Block[]> {
  const fallback = DEFAULT_BLOCKS.filter((b) => b.section === section);
  try {
    const client = db();
    if (!client) return fallback;
    const { data, error } = await client
      .from("content_blocks")
      .select("id,section,title,body,is_active,sort_order")
      .eq("section", section)
      .eq("is_active", true)
      .order("sort_order")
      .order("updated_at");
    if (error || !data?.length) return fallback;
    return data as Block[];
  } catch {
    return fallback;
  }
}
