// Valeurs par défaut : utilisées si Supabase est injoignable ou vide,
// et pour pré-remplir l'admin la première fois.

export type Product = {
  id?: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_label: string | null;
  is_active: boolean;
  sort_order: number;
};

export const DEFAULT_SETTINGS: Record<string, string> = {
  phone: "+212673326244",
  whatsapp: "212673326244",
  email: "landpack72@gmail.com",
  address: "Sidi Maârouf, Rond-Point Moustakbal, Casablanca",
};

const RAW_ITEMS = [
  {
    name: "Sacs kraft",
    image: "/images/sackraft.webp",
    text: "Le classique qui porte votre nom sur chaque comptoir.",
  },
  {
    name: "Sacs non tissés",
    image: "/images/sacnnts.webp",
    text: "Plus solides, réutilisables, pour une image plus premium.",
  },
  {
    name: "Boîtes kraft",
    image: "/images/boitecraft.webp",
    text: "Pour le repas à emporter, robustes et personnalisables.",
  },
  {
    name: "Gobelets plastiques",
    image: "/images/gobletsplast.webp",
    text: "Vos boissons, votre logo, bien visible.",
  },
];

export const DEFAULT_PRODUCTS: Product[] = RAW_ITEMS.map((it, i) => ({
  name: it.name,
  description: it.text,
  image_url: it.image,
  price_label: null,
  is_active: true,
  sort_order: i,
}));
