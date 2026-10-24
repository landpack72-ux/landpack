// Valeurs par défaut du site : utilisées si Supabase est injoignable ou vide,
// et pour le bouton « Charger le contenu actuel » de l'admin.

export type Product = {
  id?: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_label: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Block = {
  id?: string;
  section: string;
  title: string | null;
  body: string | null;
  is_active: boolean;
  sort_order: number;
};

export const DEFAULT_SETTINGS: Record<string, string> = {
  phone: "+212673326244",
  whatsapp: "212673326244",
  email: "landpack72@gmail.com",
  address: "Sidi Maârouf, Rond-Point Moustakbal, Casablanca",
};

export const SECTIONS: Record<string, string> = {
  home_solutions: "Accueil : Nos solutions",
  machines: "Machines : petites machines d'emballage",
  consommables: "Machines : consommables",
  smart_solutions: "Machines : Smart Solutions",
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

const RAW_SOLUTIONS = [
  {
    title: "Emballages personnalisés",
    text: "Sacs, boîtes, sachets et emballages à l'image de votre marque.",
  },
  {
    title: "Solutions d'emballage sur mesure",
    text: "Formats, dimensions et designs adaptés à vos produits.",
  },
  {
    title: "Couverts emballés individuellement",
    text: "Solutions hygiéniques et pratiques pour la restauration.",
  },
  {
    title: "Kits de couverts",
    text: "Assemblages comprenant couverts, serviette, sel, poivre et autres accessoires selon vos besoins.",
  },
  {
    title: "Emballages alimentaires sécurisés",
    text: "Solutions conçues pour garantir l'hygiène, la protection et la bonne conservation des aliments.",
  },
  {
    title: "Optimisation des coûts d'emballage",
    text: "Accompagnement pour réduire les frais d'emballage tout en conservant qualité et présentation.",
  },
  {
    title: "Conseil et orientation",
    text: "Aide au choix de l'emballage le plus adapté à chaque produit, à votre activité et à votre budget.",
  },
  {
    title: "Personnalisation avec votre identité visuelle",
    text: "Impression de logo, couleurs et éléments graphiques de votre marque.",
  },
  {
    title: "Solutions écoresponsables",
    text: "Sélection d'emballages recyclables, compostables ou fabriqués à partir de matériaux plus responsables.",
  },
  {
    title: "Approvisionnement régulier",
    text: "Solutions adaptées aux besoins récurrents des professionnels.",
  },
  {
    title: "Commandes en grandes quantités",
    text: "Accompagnement pour les besoins des restaurants, chaînes et professionnels.",
  },
  {
    title: "Développement de solutions spécifiques",
    text: "Création d'emballages répondant à des besoins particuliers.",
  },
  {
    title: "Échantillonnage et validation",
    text: "Possibilité de tester les formats et solutions avant la production.",
  },
  {
    title: "Accompagnement professionnel",
    text: "Conseil de la conception jusqu'à la mise en place de vos solutions d'emballage.",
  },
];

const RAW_MACHINES = [
  {
    title: "Machines sous vide",
    text: "Pour prolonger la conservation et protéger les produits.",
  },
  {
    title: "Machines à sceller les gobelets",
    text: "Pour gobelets en carton et en plastique, adaptées aux boissons froides et chaudes selon le modèle.",
  },
  {
    title: "Scelleuses de barquettes",
    text: "Pour fermer hermétiquement les barquettes alimentaires et faciliter le transport.",
  },
  {
    title: "Machines de mise sous film",
    text: "Pour protéger et présenter différents produits alimentaires.",
  },
  {
    title: "Petites machines de conditionnement",
    text: "Solutions adaptées aux besoins des restaurants, snacks, traiteurs et petites unités de production.",
  },
  {
    title: "Machines et équipements sur demande",
    text: "Orientation vers la solution adaptée au volume et au type de produit.",
  },
];

const RAW_CONSOMMABLES = [
  { title: "Rouleaux de film", text: "Pour machines à sceller." },
  { title: "Films pour scelleuses de gobelets", text: "" },
  { title: "Films pour barquettes", text: "" },
  { title: "Sachets sous vide", text: "" },
  { title: "Films alimentaires", text: "Adaptés aux différentes applications." },
  { title: "Barquettes compatibles", text: "Avec les machines de scellage." },
  { title: "Couvercles et accessoires", text: "" },
  { title: "Consommables personnalisables", text: "Selon les besoins." },
  { title: "Pièces et accessoires d'usure", text: "Selon disponibilité." },
];

const RAW_SMART = [
  {
    title: "Pack complet restaurant",
    text: "Machine + emballages + consommables + accompagnement.",
  },
  {
    title: "Solution à la carte",
    text: "Sélection des équipements et emballages selon votre activité et votre budget.",
  },
  {
    title: "Diagnostic emballage",
    text: "Analyse de vos emballages actuels afin d'identifier les possibilités d'optimisation.",
  },
  {
    title: "Calcul et optimisation des coûts",
    text: "Recherche de solutions permettant de réduire le coût par portion ou par commande.",
  },
  {
    title: "Solution Click & Collect / livraison",
    text: "Emballages adaptés au transport, à la conservation et à la présentation.",
  },
  {
    title: "Solution anti-fuite",
    text: "Choix d'emballages et de systèmes de fermeture adaptés aux plats en sauce et aux boissons.",
  },
  {
    title: "Solution branding",
    text: "Emballages, gobelets, sacs et accessoires personnalisés à l'image de votre marque.",
  },
  {
    title: "Kits prêts à l'emploi",
    text: "Assemblage de couverts, serviettes et accessoires pour gagner du temps en préparation.",
  },
  {
    title: "Solutions écoresponsables",
    text: "Alternatives recyclables, compostables ou à contenu recyclé selon les besoins.",
  },
  {
    title: "Échantillons et tests",
    text: "Validation du format et de la compatibilité avant une commande importante.",
  },
  {
    title: "Accompagnement technique",
    text: "Conseil pour le choix, l'utilisation et l'entretien des équipements.",
  },
  {
    title: "Approvisionnement régulier",
    text: "Mise en place de solutions adaptées aux besoins récurrents des professionnels.",
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

function toBlocks(section: string, list: { title: string; text: string }[]): Block[] {
  return list.map((x, i) => ({
    section,
    title: x.title,
    body: x.text || null,
    is_active: true,
    sort_order: i,
  }));
}

export const DEFAULT_BLOCKS: Block[] = [
  ...toBlocks("home_solutions", RAW_SOLUTIONS),
  ...toBlocks("machines", RAW_MACHINES),
  ...toBlocks("consommables", RAW_CONSOMMABLES),
  ...toBlocks("smart_solutions", RAW_SMART),
];
