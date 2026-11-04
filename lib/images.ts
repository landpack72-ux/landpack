// Images du site : formats imposés par emplacement + versions légères pour le téléphone.
// Quand le client envoie une photo depuis l'admin, elle est convertie en WebP, adaptée à son emplacement
// (carré à fond blanc pour un article, recadrée pour une catégorie ou le diaporama…), puis enregistrée en
// 3 tailles : grande, moyenne (-md) et petite (-sm). Le navigateur choisit seul la taille utile (srcset).

export type ImagePreset = "product" | "category" | "slide" | "logo" | "generic";

export type PresetDef = {
  w: number; // largeur de l'image principale
  h: number | null; // hauteur (null = proportions d'origine)
  fit: "contain" | "cover" | "inside"; // contain : entière sur fond ; cover : recadrée ; inside : réduite seulement
  bg: string | null; // fond (contain)
  quality: number;
  md: number; // largeurs des versions légères
  sm: number;
  label: string; // pour l'admin
  hint: string;
};

export const PRESETS: Record<ImagePreset, PresetDef> = {
  product: {
    w: 1000, h: 1000, fit: "contain", bg: "#ffffff", quality: 0.86, md: 640, sm: 320,
    label: "Photo d'article (carré)",
    hint: "Format carré : votre photo est placée entière sur fond blanc, rien n'est coupé.",
  },
  category: {
    w: 1200, h: 900, fit: "cover", bg: null, quality: 0.84, md: 640, sm: 320,
    label: "Photo de catégorie (4:3)",
    hint: "Format 4:3 : la photo est recadrée au centre pour remplir la carte.",
  },
  slide: {
    w: 1920, h: 720, fit: "cover", bg: null, quality: 0.8, md: 1280, sm: 768,
    label: "Bannière du diaporama (large)",
    hint: "Format très large : la photo est recadrée au centre. Évitez le texte sur les bords.",
  },
  logo: {
    w: 700, h: 700, fit: "inside", bg: null, quality: 0.92, md: 0, sm: 0,
    label: "Logo",
    hint: "Le logo garde ses proportions et son fond transparent.",
  },
  generic: {
    w: 1600, h: null, fit: "inside", bg: null, quality: 0.84, md: 960, sm: 480,
    label: "Photo",
    hint: "La photo est réduite et allégée, sans être recadrée.",
  },
};

export type Variant = "md" | "sm";

const UPLOAD = /\/storage\/v1\/object\/public\/site-images\/(?:content|products)\/\d+-[0-9a-f]{8}\.webp(?:\?.*)?$/;
// Images d'exemple livrées avec le site (leurs versions -md et -sm existent dans public/images).
const LOCAL = new Set(["boitekraft", "perso1", "surmesure2", "sackraft", "gobletsplast", "gobletplast", "goblets", "boitecraft", "tout", "perso", "surmesure"]);

const stripQuery = (url: string) => url.replace(/\?.*$/, "");
export const variantUrl = (url: string, v: Variant) => stripQuery(url).replace(/\.webp$/, `-${v}.webp`);

/**
 * « srcset » d'une image du site, ou null s'il ne faut afficher que l'image principale.
 * Règle de sécurité : on ne propose JAMAIS une version dont on n'est pas sûr qu'elle existe.
 *  - images d'exemple livrées avec le site : leurs versions -sm et -md existent ;
 *  - photos envoyées depuis l'admin : l'adresse porte la note « ?v=petite-moyenne-grande » avec les versions créées (0 = absente) ;
 *  - toute autre image (ancienne, ou sans note) : image principale seule.
 */
export function srcSetFor(url: string | null | undefined, preset: ImagePreset = "generic"): string | null {
  void preset;
  if (!url) return null;
  const local = /^\/images\/([a-z0-9]+)\.webp$/.exec(url);
  if (local && LOCAL.has(local[1])) return `${variantUrl(url, "sm")} 480w, ${variantUrl(url, "md")} 960w, ${url} 1500w`;

  const note = /[?&]v=(\d+)-(\d+)-(\d+)(?:&|$)/.exec(url);
  if (!note || !UPLOAD.test(url)) return null;
  const [sm, md, full] = [Number(note[1]), Number(note[2]), Number(note[3])];
  const parts: string[] = [];
  if (sm > 0) parts.push(`${variantUrl(url, "sm")} ${sm}w`);
  if (md > 0) parts.push(`${variantUrl(url, "md")} ${md}w`);
  if (parts.length === 0 || full <= 0) return null; // aucune version légère : image principale seule
  parts.push(`${stripQuery(url)} ${full}w`);
  return parts.join(", ");
}
