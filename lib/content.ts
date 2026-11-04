// ---------------------------------------------------------------------------
// SCHÉMA DU CONTENU DU SITE
// Chaque « section » = un bloc de contenu modifiable depuis /admin.
//  - mode "single" : un seul bloc (ex. le titre d'une zone)
//  - mode "list"   : une liste d'éléments (ex. les diapositives)
// Les produits, les catégories, les coordonnées et le logo ont leurs propres onglets.
// Pour rendre un nouveau texte modifiable : l'ajouter ici, puis l'utiliser
// dans un composant avec getText("id") ou getList("id").
// ---------------------------------------------------------------------------

export type FieldKind = "text" | "textarea" | "image" | "toggle" | "color" | "select" | "range";
export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: { value: string; label: string }[]; // pour "select"
  min?: number; // pour "range"
  max?: number;
  step?: number;
};
export type SectionDef = {
  id: string;
  page: string;
  label: string;
  mode: "single" | "list";
  fields: Field[];
  defaults: Record<string, string>[];
  hint?: string;
  resettable?: boolean; // affiche « Rétablir les valeurs d'origine »
};

export const PAGES: Record<string, string> = {
  home: "Page d'accueil (diaporama, textes)",
  global: "Tout le site (menu, pied de page)",
  style: "Style du site (couleurs, polices, tailles)",
};

const T = (key: string, label: string): Field => ({ key, label, kind: "text" });
const A = (key: string, label: string): Field => ({ key, label, kind: "textarea" });
const I = (key: string, label: string): Field => ({ key, label, kind: "image" });
const C = (key: string, label: string): Field => ({ key, label, kind: "color" });
const S = (key: string, label: string, options: { value: string; label: string }[]): Field => ({ key, label, kind: "select", options });
const R = (key: string, label: string, min: number, max: number, step: number): Field => ({ key, label, kind: "range", min, max, step });

// Polices proposées au client (elles sont installées avec le site).
export const FONT_DISPLAY_OPTIONS = [
  { value: "Sora", label: "Sora (actuelle) : moderne et arrondie" },
  { value: "Poppins", label: "Poppins : géométrique et amicale" },
  { value: "Montserrat", label: "Montserrat : élégante et sobre" },
  { value: "Playfair Display", label: "Playfair Display : chic, avec empattements" },
  { value: "Lora", label: "Lora : classique, avec empattements" },
];
export const FONT_BODY_OPTIONS = [
  { value: "DM Sans", label: "DM Sans (actuelle) : lisible et neutre" },
  { value: "Inter", label: "Inter : très lisible à l'écran" },
  { value: "Nunito", label: "Nunito : douce et arrondie" },
  { value: "Poppins", label: "Poppins : géométrique" },
  { value: "Montserrat", label: "Montserrat : élégante" },
  { value: "Lora", label: "Lora : avec empattements" },
];

export const SECTION_DEFS: SectionDef[] = [
  /* ============================ STYLE ============================ */
  { id: "style.theme", page: "style", label: "Couleurs, polices et tailles de texte", mode: "single", resettable: true,
    hint: "Le texte blanc se pose sur le vert, le texte foncé sur le kraft : gardez un vert assez foncé et un kraft assez clair. « Rétablir » remet le style d'origine.",
    fields: [
      C("color_water", "Couleur principale : vert (boutons, menu, pied de page)"),
      C("color_water_dark", "Vert foncé (survol)"),
      C("color_kraft", "Couleur secondaire : kraft (étiquettes, accents, survol du menu)"),
      C("color_kraft_dark", "Kraft foncé (survol)"),
      C("color_ink", "Couleur du texte"),
      C("color_ink_soft", "Couleur du texte secondaire"),
      C("color_cream", "Fond du site"),
      C("color_paper", "Fond clair des cartes et des sections"),
      S("font_display", "Police des titres", FONT_DISPLAY_OPTIONS),
      S("font_body", "Police des textes", FONT_BODY_OPTIONS),
      R("size_title", "Taille des titres", 0.85, 1.35, 0.05),
      R("size_body", "Taille des textes", 0.9, 1.3, 0.05),
    ],
    defaults: [{
      color_water: "#1b5e20", color_water_dark: "#144a18", color_kraft: "#e2ae78", color_kraft_dark: "#d39b62", color_ink: "#2b2118", color_ink_soft: "#6b5a4a",
      color_cream: "#ffffff", color_paper: "#faf3e8",
      font_display: "Sora", font_body: "DM Sans", size_title: "1", size_body: "1",
    }] },

  /* ============================ ACCUEIL ============================ */
  { id: "seo.home", page: "home", label: "Google : titre, description et mots-clés", mode: "single",
    fields: [
      T("title", "Titre dans Google (60 caractères environ)"),
      A("description", "Description dans Google (150 caractères environ)"),
      A("keywords", "Mots-clés (séparés par des virgules)"),
    ],
    defaults: [{
      title: "Emballages alimentaires personnalisés au Maroc | Landpack",
      description: "Landpack personnalise vos emballages alimentaires à votre logo : boîtes pizza et lunch, sachets, sacs kraft, gobelets plastiques et kraft, cartons. Impression de votre logo sur chaque article. Atelier à Casablanca, livraison partout au Maroc.",
      keywords: "emballage alimentaire personnalisé Maroc, boîte pizza personnalisée, boîte lunch personnalisée, sachet alimentaire personnalisé, sac kraft personnalisé, gobelet personnalisé Maroc, gobelet kraft, carton personnalisé, emballage avec logo Casablanca, Landpack",
    }] },
  { id: "home.slides", page: "home", label: "Diaporama (grande bannière en haut de l'accueil)", mode: "list",
    hint: "Photo conseillée : format large (1600 × 600 pixels environ). Lien : /#boites-pizza, /devis...",
    fields: [I("image", "Photo"), T("title", "Titre"), A("text", "Texte"), T("cta", "Texte du bouton"), T("href", "Lien du bouton")],
    defaults: [
      { image: "/images/tout.webp", title: "Emballages alimentaires personnalisés", text: "Boîtes, sachets, sacs kraft, gobelets et cartons imprimés à votre logo.", cta: "Voir les catégories", href: "/categorie/boites" },
      { image: "/images/perso.webp", title: "Votre logo sur chaque emballage", text: "Choisissez le modèle, envoyez votre logo en commandant : nous l'imprimons.", cta: "Voir les sacs kraft", href: "/categorie/sacs-kraft" },
      { image: "/images/surmesure.webp", title: "Votre marque sur chaque détail", text: "Gobelets, boîtes, sachets et sacs : tout est imprimé à votre logo.", cta: "Voir les gobelets", href: "/categorie/gobelets-plastiques" },
    ] },
  { id: "home.steps_head", page: "home", label: "Comment commander : titre", mode: "single",
    fields: [T("title", "Titre"), A("text", "Texte")],
    defaults: [{ title: "Comment commander", text: "Trois étapes pour recevoir vos emballages à votre image." }] },
  { id: "home.steps", page: "home", label: "Comment commander : étapes (numérotées automatiquement)", mode: "list",
    fields: [T("title", "Titre"), A("text", "Texte")],
    defaults: [
      { title: "Choisissez votre article", text: "Parcourez les catégories, ouvrez la fiche du modèle et choisissez la quantité." },
      { title: "Envoyez votre logo", text: "Sur la fiche de l'article, ajoutez votre logo (PNG, JPG ou WebP) et indiquez la quantité." },
      { title: "Nous imprimons et livrons", text: "Nous vous appelons pour confirmer, puis nous produisons et livrons." },
    ] },

  /* ============================ TOUT LE SITE ============================ */
  { id: "global.header", page: "global", label: "Menu : phrase d'accroche et bouton devis", mode: "single",
    fields: [T("tagline", "Phrase d'accroche (bandeau en haut du site)"), T("cta_label", "Texte du bouton")],
    defaults: [{ tagline: "Livraison partout au Maroc · Emballages personnalisés avec votre logo", cta_label: "Demander un devis" }] },
  { id: "global.footer", page: "global", label: "Pied de page", mode: "single",
    hint: "L'adresse, le téléphone et WhatsApp se modifient dans l'onglet « Coordonnées ».",
    fields: [
      A("tagline", "Phrase de présentation"), T("products_title", "Titre de la colonne produits"),
      T("contact_title", "Titre de la colonne contact"), T("note", "Phrase tout en bas"),
    ],
    defaults: [{
      tagline: "Emballages alimentaires personnalisés à votre logo : boîtes, sachets, sacs kraft, gobelets et cartons.",
      products_title: "Nos produits", contact_title: "Contact", note: "Landpack, personnalisation d'emballages alimentaires.",
    }] },
];

export const DEF_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTION_DEFS.map((d) => [d.id, d]),
);
