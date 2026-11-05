// Valeurs par défaut : utilisées si Supabase est injoignable ou vide,
// et pour pré-remplir l'admin la première fois.

export type Category = {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Product = {
  id?: string;
  category_id?: string | null;
  name: string;
  dimensions: string | null;
  description: string | null;
  image_url: string | null;
  unit_price: number | null; // prix par pièce en dirhams (ex. 1.20), modifiable depuis l'admin
  price_label: string | null; // ancien champ texte, conservé pour compatibilité
  min_qty: number | null; // quantité minimale (sinon celle du site : 50)
  custom_price_label: string | null; // ancien champ, conservé pour compatibilité
  custom_min_qty: number | null; // ancien champ, conservé pour compatibilité
  is_active: boolean;
  sort_order: number;
};

export const DEFAULT_SETTINGS: Record<string, string> = {
  phone: "+212673326244",
  whatsapp: "212673326244",
  email: "",
  address: "Sidi Maârouf, Rond-Point Moustakbal, Casablanca",
  logo_url: "/assets/logo.webp",
  // Règles de prix (modifiables dans l'admin : Catalogue > Tarifs et remises)
  qty_min: "50",
  qty_step: "50",
  discount_threshold: "1000",
  discount_percent: "15",
  // Informations légales (à compléter dans l'admin : Coordonnées & logo > Informations légales)
  legal_name: "",
  legal_form: "",
  legal_ice: "",
  legal_rc: "",
  legal_address: "",
  legal_email: "",
  legal_publisher: "",
  legal_cndp: "",
  legal_data_region: "",
  legal_retention_orders: "",
  legal_updated: "",
  legal_cgv_published: "0", // « 1 » : le lien vers les conditions de vente apparaît dans le pied de page
};

// Six catégories, six modèles chacune. Les dimensions et photos sont des EXEMPLES
// à remplacer depuis l'admin (Catalogue).
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "boites", name: "Boîtes (pizza, lunch…)", description: "Boîtes alimentaires en carton, pour pizzas, repas à emporter et plus, imprimées à votre logo.", image_url: "/images/boitekraft.webp", sort_order: 0, is_active: true },
  { slug: "sachets", name: "Sachets", description: "Sachets alimentaires personnalisés : pâtisseries, sandwichs, snacks.", image_url: "/images/surmesure2.webp", sort_order: 1, is_active: true },
  { slug: "sacs-kraft", name: "Sacs kraft", description: "Sacs kraft avec poignées, imprimés à votre logo.", image_url: "/images/sackraft.webp", sort_order: 2, is_active: true },
  { slug: "gobelets-plastiques", name: "Gobelets plastiques", description: "Gobelets transparents personnalisés pour boissons froides.", image_url: "/images/gobletsplast.webp", sort_order: 3, is_active: true },
  { slug: "gobelets-kraft", name: "Gobelets kraft", description: "Gobelets en carton kraft pour boissons chaudes et froides, imprimés à votre logo.", image_url: "/images/goblets.webp", sort_order: 4, is_active: true },
  { slug: "cartons", name: "Cartons", description: "Cartons d'expédition et de transport, personnalisables à votre marque.", image_url: "/images/boitecraft.webp", sort_order: 5, is_active: true },
];

export const DEFAULT_MODELS: Record<string, { name: string; dimensions: string; image: string }[]> = {
  "boites": [{"name": "Boîte pizza", "dimensions": "26 × 26 × 4 cm", "image": "/images/boitekraft.webp"}, {"name": "Boîte pizza", "dimensions": "33 × 33 × 4 cm", "image": "/images/boitekraft.webp"}, {"name": "Boîte pizza", "dimensions": "40 × 40 × 4 cm", "image": "/images/boitekraft.webp"}, {"name": "Boîte lunch", "dimensions": "18 × 12 × 5 cm", "image": "/images/perso1.webp"}, {"name": "Boîte lunch", "dimensions": "22 × 15 × 6 cm", "image": "/images/perso1.webp"}, {"name": "Boîte lunch", "dimensions": "26 × 18 × 7 cm", "image": "/images/perso1.webp"}],
  "sachets": [{"name": "Sachet", "dimensions": "10 × 15 cm", "image": "/images/surmesure2.webp"}, {"name": "Sachet", "dimensions": "12 × 20 cm", "image": "/images/surmesure2.webp"}, {"name": "Sachet", "dimensions": "15 × 25 cm", "image": "/images/surmesure2.webp"}, {"name": "Sachet", "dimensions": "18 × 28 cm", "image": "/images/surmesure2.webp"}, {"name": "Sachet", "dimensions": "20 × 30 cm", "image": "/images/surmesure2.webp"}, {"name": "Sachet", "dimensions": "25 × 35 cm", "image": "/images/surmesure2.webp"}],
  "sacs-kraft": [{"name": "Sac kraft", "dimensions": "18 × 8 × 22 cm", "image": "/images/sackraft.webp"}, {"name": "Sac kraft", "dimensions": "22 × 10 × 28 cm", "image": "/images/sackraft.webp"}, {"name": "Sac kraft", "dimensions": "26 × 12 × 32 cm", "image": "/images/sackraft.webp"}, {"name": "Sac kraft", "dimensions": "30 × 14 × 36 cm", "image": "/images/sackraft.webp"}, {"name": "Sac kraft", "dimensions": "32 × 16 × 40 cm", "image": "/images/sackraft.webp"}, {"name": "Sac kraft", "dimensions": "36 × 18 × 44 cm", "image": "/images/sackraft.webp"}],
  "gobelets-plastiques": [{"name": "Gobelet plastique", "dimensions": "8 oz (240 ml)", "image": "/images/gobletsplast.webp"}, {"name": "Gobelet plastique", "dimensions": "12 oz (360 ml)", "image": "/images/gobletplast.webp"}, {"name": "Gobelet plastique", "dimensions": "14 oz (420 ml)", "image": "/images/gobletsplast.webp"}, {"name": "Gobelet plastique", "dimensions": "16 oz (480 ml)", "image": "/images/gobletplast.webp"}, {"name": "Gobelet plastique", "dimensions": "20 oz (600 ml)", "image": "/images/gobletsplast.webp"}, {"name": "Gobelet plastique", "dimensions": "24 oz (720 ml)", "image": "/images/gobletplast.webp"}],
  "gobelets-kraft": [{"name": "Gobelet kraft", "dimensions": "4 oz (120 ml)", "image": "/images/goblets.webp"}, {"name": "Gobelet kraft", "dimensions": "8 oz (240 ml)", "image": "/images/goblets.webp"}, {"name": "Gobelet kraft", "dimensions": "10 oz (300 ml)", "image": "/images/goblets.webp"}, {"name": "Gobelet kraft", "dimensions": "12 oz (360 ml)", "image": "/images/goblets.webp"}, {"name": "Gobelet kraft", "dimensions": "16 oz (480 ml)", "image": "/images/goblets.webp"}, {"name": "Gobelet kraft", "dimensions": "20 oz (600 ml)", "image": "/images/goblets.webp"}],
  "cartons": [{"name": "Carton", "dimensions": "20 × 15 × 10 cm", "image": "/images/boitecraft.webp"}, {"name": "Carton", "dimensions": "25 × 20 × 12 cm", "image": "/images/boitecraft.webp"}, {"name": "Carton", "dimensions": "30 × 20 × 15 cm", "image": "/images/boitecraft.webp"}, {"name": "Carton", "dimensions": "35 × 25 × 20 cm", "image": "/images/boitecraft.webp"}, {"name": "Carton", "dimensions": "40 × 30 × 25 cm", "image": "/images/boitecraft.webp"}, {"name": "Carton", "dimensions": "50 × 40 × 30 cm", "image": "/images/boitecraft.webp"}],
};

// Prix par pièce INDICATIFS, en attendant les vrais tarifs (à modifier depuis l'admin).
const PRICES: Record<string, number[]> = {"boites": [2.2, 2.8, 3.6, 1.4, 1.8, 2.3], "sachets": [0.45, 0.6, 0.8, 1.0, 1.3, 1.7], "sacs-kraft": [1.6, 2.0, 2.5, 3.1, 3.8, 4.6], "gobelets-plastiques": [0.55, 0.7, 0.8, 0.95, 1.2, 1.5], "gobelets-kraft": [0.5, 0.75, 0.9, 1.1, 1.4, 1.8], "cartons": [3.0, 4.2, 5.5, 7.5, 10.0, 14.0]};

export function defaultProducts(): (Product & { category_slug: string })[] {
  return DEFAULT_CATEGORIES.flatMap((c) =>
    (DEFAULT_MODELS[c.slug] ?? []).map((m, i) => ({
      id: `${c.slug}-${i + 1}`,
      category_slug: c.slug,
      category_id: c.slug,
      name: m.name,
      dimensions: m.dimensions,
      description: null,
      image_url: m.image,
      unit_price: PRICES[c.slug]?.[i] ?? null,
      price_label: null,
      min_qty: null,
      custom_price_label: null,
      custom_min_qty: null,
      is_active: true,
      sort_order: i,
    })),
  );
}

/** Prix et quantité minimale d'un modèle (Landpack ne fait que la personnalisation). */
export const priceOf = (p: Pick<Product, "price_label" | "custom_price_label">) => p.price_label ?? p.custom_price_label ?? null;
export const minQtyOf = (p: Pick<Product, "min_qty" | "custom_min_qty">) => p.min_qty ?? p.custom_min_qty ?? null;

/** Titre d'un modèle, comme sur une boutique : « Sachet – 12 × 20 cm ». */
export function modelTitle(p: { name: string; dimensions: string | null }): string {
  return p.dimensions ? `${p.name} – ${p.dimensions}` : p.name;
}
