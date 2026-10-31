// ---------------------------------------------------------------------------
// SCHÉMA DU CONTENU DU SITE
// Chaque « section » = un bloc de contenu modifiable depuis /admin.
//  - mode "single" : un seul bloc (ex. le titre de l'accueil)
//  - mode "list"   : une liste d'éléments (ex. les étapes, les solutions)
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
  global: "Tout le site (menu, pied de page, devis)",
  style: "Style du site (couleurs, polices, tailles)",
  home: "Page d'accueil",
  perso: "Page Personnalisation",
  surmesure: "Page Sur mesure",
  machines: "Page Solutions & Machines",
};

const T = (key: string, label: string): Field => ({ key, label, kind: "text" });
const A = (key: string, label: string): Field => ({ key, label, kind: "textarea" });
const I = (key: string, label: string): Field => ({ key, label, kind: "image" });
const Tg = (key: string, label: string): Field => ({ key, label, kind: "toggle" });
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

const SOLUTIONS = [
  {
    title: "Emballages personnalisés",
    text: "Sacs, boîtes, sachets et gobelets personnalisés à votre logo et à vos couleurs, pour des emballages à l'image de votre marque.",
  },
  {
    title: "Solutions d'emballage sur mesure",
    text: "Formats, dimensions et designs personnalisés, entièrement adaptés à vos produits.",
  },
  {
    title: "Couverts emballés individuellement",
    text: "Solutions hygiéniques et pratiques pour la restauration, avec un emballage personnalisable à votre marque.",
  },
  {
    title: "Kits de couverts",
    text: "Assemblages personnalisés comprenant couverts, serviette, sel, poivre et autres accessoires, emballés à votre image.",
  },
  {
    title: "Emballages alimentaires sécurisés",
    text: "Emballages personnalisés conçus pour garantir l'hygiène, la protection et la bonne conservation des aliments.",
  },
  {
    title: "Optimisation des coûts d'emballage",
    text: "Accompagnement pour réduire les frais d'emballage tout en gardant une personnalisation de qualité et une belle présentation.",
  },
  {
    title: "Conseil et orientation",
    text: "Aide au choix de l'emballage personnalisé le plus adapté à chaque produit, à votre activité et à votre budget.",
  },
  {
    title: "Personnalisation avec votre identité visuelle",
    text: "Impression de votre logo, de vos couleurs et de vos éléments graphiques sur chaque emballage.",
  },
  {
    title: "Solutions écoresponsables",
    text: "Emballages personnalisables recyclables, compostables ou fabriqués à partir de matériaux plus responsables.",
  },
  {
    title: "Approvisionnement régulier",
    text: "Réassort régulier de vos emballages personnalisés, adapté aux besoins récurrents des professionnels.",
  },
  {
    title: "Commandes en grandes quantités",
    text: "Emballages personnalisés en grandes quantités pour les restaurants, chaînes et professionnels.",
  },
  {
    title: "Développement de solutions spécifiques",
    text: "Création d'emballages personnalisés répondant à des besoins particuliers.",
  },
  {
    title: "Échantillonnage et validation",
    text: "Testez vos formats et votre personnalisation sur échantillon avant la production.",
  },
  {
    title: "Accompagnement professionnel",
    text: "Conseil de la conception de votre emballage personnalisé jusqu'à la mise en place de vos solutions.",
  },
];
const MACHINES = [
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
const CONSOMMABLES = [
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
const SMART = [
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

const SEO_FIELDS = [
  T("title", "Titre dans Google (60 caractères environ)"),
  A("description", "Description dans Google (150 caractères environ)"),
];

export const SECTION_DEFS: SectionDef[] = [
  /* ============================ STYLE ============================ */
  { id: "style.theme", page: "style", label: "Couleurs, polices et tailles de texte", mode: "single", resettable: true,
    hint: "Choisissez des couleurs bien contrastées (texte foncé sur fond clair) pour que le site reste lisible. « Rétablir » remet le style d'origine.",
    fields: [
      C("color_water", "Couleur principale (boutons, bandeaux bleus)"),
      C("color_water_dark", "Couleur principale foncée (survol, fonds sombres)"),
      C("color_ink", "Couleur du texte"),
      C("color_ink_soft", "Couleur du texte secondaire"),
      C("color_cream", "Fond du site"),
      C("color_paper", "Fond des cartes"),
      C("color_gold", "Couleur d'accent (détails dorés)"),
      C("color_stamp", "Couleur des tampons"),
      C("color_nature", "Couleur verte (accent secondaire)"),
      S("font_display", "Police des titres", FONT_DISPLAY_OPTIONS),
      S("font_body", "Police des textes", FONT_BODY_OPTIONS),
      R("size_title", "Taille des titres", 0.85, 1.35, 0.05),
      R("size_body", "Taille des textes", 0.9, 1.3, 0.05),
    ],
    defaults: [{
      color_water: "#1a7fa8", color_water_dark: "#145f80", color_ink: "#17242b", color_ink_soft: "#3d5560",
      color_cream: "#faf8f1", color_paper: "#f1e6cb", color_gold: "#c4a265", color_stamp: "#9a2e1e", color_nature: "#3a7d5c",
      font_display: "Sora", font_body: "DM Sans", size_title: "1", size_body: "1",
    }] },
  /* ============================ TOUT LE SITE ============================ */
  { id: "global.header", page: "global", label: "Menu : bouton devis", mode: "single",
    fields: [T("cta_label", "Texte du bouton")],
    defaults: [{ cta_label: "Demander un devis" }] },
  { id: "global.nav", page: "global", label: "Menu : liens", mode: "list",
    hint: "Lien : /#produits, /#conseils, /#contact, /personnalisation...",
    fields: [T("label", "Texte"), T("href", "Lien")],
    defaults: [
      { label: "Produits", href: "/#produits" },
      { label: "Conseils", href: "/#conseils" },
      { label: "Contact", href: "/#contact" },
    ] },
  { id: "global.cta", page: "global", label: "Bandeau « Nous contacter » (bas des sous-pages)", mode: "single",
    fields: [A("text", "Texte"), T("button", "Texte du bouton")],
    defaults: [{ text: "Dites-nous ce qu'il vous faut, on revient vers vous avec un prix et une maquette.", button: "Nous contacter" }] },
  { id: "global.footer", page: "global", label: "Pied de page", mode: "single",
    hint: "Laissez vide l'adresse Instagram ou Facebook pour masquer le lien. La liste « Produits » du pied de page vient du catalogue.",
    fields: [
      A("tagline", "Phrase de présentation"), T("products_title", "Titre colonne produits"),
      T("workshop_title", "Titre colonne atelier"), T("social_title", "Titre colonne réseaux"),
      T("instagram_url", "Lien Instagram (https://...)"), T("facebook_url", "Lien Facebook (https://...)"),
      T("note", "Phrase tout en bas"),
    ],
    defaults: [{
      tagline: "Emballages alimentaires personnalisés — sacs kraft, boîtes et gobelets imprimés à votre logo à Casablanca.",
      products_title: "Produits", workshop_title: "Atelier", social_title: "Suivez l'atelier",
      instagram_url: "", facebook_url: "", note: "Imprimé avec soin, un tampon à la fois.",
    }] },

  /* ============================ ACCUEIL ============================ */
  { id: "home.layout", page: "home", label: "Afficher ou masquer les sections de l'accueil", mode: "single",
    hint: "Décochez une section pour la retirer complètement de la page d'accueil (son lien disparaît aussi du menu). Son contenu reste enregistré : vous pouvez la réafficher à tout moment.",
    fields: [
      Tg("show_offers", "Nos offres (les 3 cartes)"),
      Tg("show_solutions", "Nos solutions (liste détaillée)"),
      Tg("show_advice", "Conseils & accompagnement"),
      Tg("show_contact", "Contact"),
      Tg("show_map", "Carte Google"),
      Tg("show_cta", "Bandeau devis (formulaire)"),
    ],
    defaults: [{ show_offers: "1", show_solutions: "0", show_advice: "1", show_contact: "1", show_map: "1", show_cta: "1" }] },
  { id: "seo.home", page: "home", label: "Google : titre et description de l'accueil", mode: "single",
    fields: [...SEO_FIELDS, A("keywords", "Mots-clés (séparés par des virgules)")],
    defaults: [{ title: "Landpack — Emballages alimentaires personnalisés à votre logo au Maroc", description: "Landpack personnalise vos emballages alimentaires au Maroc : sacs kraft, sacs non tissés, boîtes, gobelets et sachets imprimés à votre logo et à vos couleurs. Formats sur mesure, petites séries, atelier à Casablanca, livraison partout au Maroc.", keywords: "emballage personnalisé Maroc, personnalisation emballage alimentaire, emballage avec logo Casablanca, emballage alimentaire Maroc, emballage alimentaire Casablanca, solutions d'emballage Maroc, solutions d'emballage sur mesure, emballage restaurateurs traiteurs hôtels, sac kraft personnalisé Maroc, sac kraft personnalisé Casablanca, sac non tissé personnalisé, boîte kraft alimentaire personnalisée, gobelet personnalisé Maroc, gobelet transparent 12oz 14oz 16oz, couverts emballés individuellement, kits de couverts restauration, emballage écoresponsable Maroc, emballage recyclable compostable Maroc, optimisation des coûts d'emballage, impression logo emballage Maroc, packaging alimentaire sur mesure Maroc, fournisseur emballage alimentaire Maroc, machine de conditionnement Maroc, machine de scellage banderolage, machine sous vide Maroc, scelleuse de gobelets Maroc, scelleuse de barquettes Maroc, consommables emballage alimentaire Maroc, film alimentaire sous vide Maroc, barquettes alimentaires Maroc, pack complet restaurant emballage, diagnostic emballage optimisation coûts, solution click and collect emballage, emballage anti-fuite plats en sauce, emballage à emporter personnalisé, Landpack" }] },
  { id: "home.hero", page: "home", label: "Haut de page (grande photo)", mode: "single",
    fields: [
      I("image", "Photo"), T("image_alt", "Description de la photo"), T("badge", "Petit tampon"),
      T("title", "Grand titre"), A("text", "Texte"), T("cta1", "Bouton 1"), T("cta2", "Bouton 2"),
    ],
    defaults: [{
      image: "/images/tout.webp", image_alt: "Landpack — sacs kraft, boîtes et gobelets personnalisés",
      badge: "Personnalisation d'emballages · Casablanca", title: "Tous vos emballages, une seule adresse.",
      text: "Sacs kraft, boîtes et gobelets personnalisés à votre logo et à vos couleurs. Landpack habille chaque emballage à l'image de votre marque.",
      cta1: "Demander un devis gratuit", cta2: "Voir les produits",
    }] },
  { id: "home.offers_head", page: "home", label: "Nos offres : titre de la section", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ badge: "Nos offres", title: "Produits & services, à votre marque.",
      text: "De la personnalisation de vos emballages à votre logo jusqu'au choix des machines, Landpack couvre tout le parcours de votre emballage." }] },
  { id: "home.offers", page: "home", label: "Nos offres : les 3 cartes", mode: "list",
    hint: "Étiquettes : mots séparés par des virgules (facultatif). Lien : /personnalisation, /sur-mesure, /solutions-machines.",
    fields: [I("image", "Photo"), T("title", "Titre"), A("tagline", "Texte"), T("tags", "Étiquettes"), T("cta", "Texte du lien"), T("href", "Lien")],
    defaults: [
      { image: "/images/perso1.webp", title: "Personnalisation", tagline: "Vos articles du quotidien personnalisés à votre logo et à vos couleurs : chaque emballage porte votre marque.", tags: "Sacs kraft, Sacs non tissés, Boîtes kraft, Gobelets", cta: "Personnaliser un article", href: "/personnalisation" },
      { image: "/images/surmesure1.webp", title: "Sur mesure", tagline: "Un format qui n'existe pas encore ? On développe avec vous un emballage entièrement personnalisé : prototypes, dimensions, matières et impression à votre image.", tags: "", cta: "Discuter d'un projet sur mesure", href: "/sur-mesure" },
      { image: "/images/solu1.webp", title: "Solutions & Machines", tagline: "Le matériel qui accompagne vos emballages personnalisés : scellage, banderolage, étiquetage — choisi et installé pour vous.", tags: "", cta: "Voir les solutions", href: "/solutions-machines" },
    ] },
  { id: "home.solutions_head", page: "home", label: "Nos solutions : titre et objectif", mode: "single",
    fields: [T("badge", "Petit tampon"), A("title", "Titre"), A("text", "Texte"), T("goal_label", "Titre de l'encadré"), A("goal_text", "Texte de l'encadré")],
    defaults: [{ badge: "Nos solutions", title: "Des solutions d'emballage sur mesure pour les professionnels de l'alimentaire.",
      text: "Landpack accompagne restaurateurs, traiteurs, hôtels, cafés et professionnels de l'alimentaire au Maroc, de la conception à la livraison de leurs emballages.",
      goal_label: "Notre objectif", goal_text: "Vous proposer un emballage pratique, sécurisé, esthétique et adapté à votre activité, tout en maîtrisant vos coûts." }] },
  { id: "home.solutions", page: "home", label: "Nos solutions : la liste", mode: "list",
    fields: [T("title", "Titre"), A("text", "Texte")], defaults: SOLUTIONS },
  { id: "home.advice", page: "home", label: "Conseils & accompagnement : textes", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte"), T("card_title", "Titre de la carte"), A("card_text", "Texte de la carte"), T("card_cta", "Bouton de la carte")],
    defaults: [{ badge: "Accompagnement", title: "Conseils & Accompagnement",
      text: "Un regard extérieur pour optimiser vos coûts et votre image packaging — au-delà de l'impression, on vous aide à faire les bons choix.",
      card_title: "Envie de construire votre packaging avec nous ?",
      card_text: "Rejoignez les marques qui font confiance à Landpack pour leurs emballages, du premier échange jusqu'à la livraison.",
      card_cta: "Nous rejoindre" }] },
  { id: "home.advice_points", page: "home", label: "Conseils & accompagnement : points", mode: "list",
    fields: [T("text", "Texte")],
    defaults: [{ text: "Audit packaging et coûts matière" }, { text: "Formation des équipes atelier" }, { text: "Veille tendances et réglementation" }] },
  { id: "home.contact", page: "home", label: "Contact : textes", mode: "single",
    hint: "Le téléphone, l'e-mail et l'adresse se modifient dans l'onglet « Coordonnées ».",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte"), T("label_phone", "Étiquette téléphone"), T("label_email", "Étiquette e-mail"), T("label_address", "Étiquette adresse")],
    defaults: [{ badge: "Contact", title: "Parlons de votre projet.",
      text: "Une question, un devis, un format un peu particulier ? L'équipe Landpack répond directement, sans détour.",
      label_phone: "Téléphone", label_email: "Email", label_address: "Atelier" }] },
  { id: "home.cta", page: "home", label: "Bandeau devis (bas de l'accueil)", mode: "single",
    hint: "Dans le titre, une nouvelle ligne crée un retour à la ligne.",
    fields: [T("badge", "Petit tampon"), A("title", "Titre"), A("text", "Texte"), T("button", "Texte du bouton")],
    defaults: [{ badge: "Devis sous 24h", title: "Prêt à voir votre logo\nsur un vrai emballage ?",
      text: "Dites-nous quel produit vous intéresse, on revient vers vous avec un prix et une maquette.", button: "Recevoir un devis" }] },

  /* ============================ PERSONNALISATION ============================ */
  { id: "seo.perso", page: "perso", label: "Google : titre et description", mode: "single", fields: SEO_FIELDS,
    defaults: [{ title: "Emballages personnalisés à votre logo — sacs, boîtes, gobelets | Landpack", description: "Personnalisez vos sacs kraft, sacs non tissés, boîtes et gobelets avec votre logo et vos couleurs : impression locale, petites séries, livraison au Maroc." }] },
  { id: "perso.hero", page: "perso", label: "Haut de page", mode: "single",
    fields: [I("image", "Photo"), T("eyebrow", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ image: "/images/perso1.webp", eyebrow: "Personnalisation", title: "Vos articles, à votre marque.",
      text: "Personnalisez vos sacs, boîtes et gobelets avec votre logo et vos couleurs : un emballage qui vous ressemble, de la maquette à la livraison." }] },
  { id: "perso.showcase_head", page: "perso", label: "Galerie : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ badge: "En images", title: "Trois univers, un seul logo.", text: "Boîtes, sacs ou housses : votre marque s'imprime partout où vous en avez besoin." }] },
  { id: "perso.showcase", page: "perso", label: "Galerie : photos", mode: "list",
    fields: [I("image", "Photo"), T("alt", "Description de la photo"), T("caption", "Légende")],
    defaults: [
      { image: "/images/perso1.webp", alt: "Boîtes kraft personnalisées Landpack", caption: "Boîtes kraft — repas à emporter, robustes et personnalisables" },
      { image: "/images/perso2.webp", alt: "Sacs personnalisés colorés Landpack", caption: "Sacs — vos couleurs, votre logo, bien visible" },
      { image: "/images/perso3.webp", alt: "Housses vêtements personnalisées Landpack", caption: "Housses — pour le textile et le pressing" },
    ] },
  { id: "perso.catalogue_head", page: "perso", label: "Catalogue : titre (les produits sont dans l'onglet « Catalogue & prix »)", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ badge: "Le catalogue", title: "Quatre supports, une seule marque.", text: "Chaque référence se personnalise entièrement : logo, couleurs, finitions. Vous choisissez le support, nous imprimons votre marque dessus." }] },
  { id: "perso.cta", page: "perso", label: "Bandeau du bas", mode: "single",
    fields: [T("title", "Titre")], defaults: [{ title: "Prêt à imprimer votre logo ?" }] },

  /* ============================ SUR MESURE ============================ */
  { id: "seo.surmesure", page: "surmesure", label: "Google : titre et description", mode: "single", fields: SEO_FIELDS,
    defaults: [{ title: "Emballage sur mesure : prototypes et petites séries | Landpack", description: "Un emballage entièrement personnalisé : Landpack développe avec vous prototypes, dimensions, matières et impression adaptés à votre produit et à votre marque." }] },
  { id: "sm.hero", page: "surmesure", label: "Haut de page", mode: "single",
    fields: [I("image", "Photo"), T("eyebrow", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ image: "/images/surmesure1.webp", eyebrow: "Sur mesure", title: "Un format qui n'existe pas encore ?",
      text: "On le développe avec vous : un emballage entièrement personnalisé, avec prototypes, dimensions, matières et impression adaptés à votre produit et à votre marque." }] },
  { id: "sm.showcase_head", page: "surmesure", label: "Exemples : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ badge: "Exemples", title: "Deux formats, deux besoins précis.", text: "Chaque produit a sa propre forme — l'emballage doit s'y adapter, pas l'inverse." }] },
  { id: "sm.showcase", page: "surmesure", label: "Exemples : photos", mode: "list",
    fields: [I("image", "Photo"), T("alt", "Description de la photo"), T("caption", "Légende")],
    defaults: [
      { image: "/images/surmesure1.webp", alt: "Emballage sur mesure pour esquimaux Landpack", caption: "Format thermoscellé sur mesure, pour un produit alimentaire précis" },
      { image: "/images/surmesure2.webp", alt: "Sachet transparent sur mesure Landpack", caption: "Sachet transparent, haut et étroit, taillé pour un produit hors standard" },
    ] },
  { id: "sm.steps_head", page: "surmesure", label: "Le process : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ badge: "Le process", title: "De l'idée au prototype.", text: "Trois étapes simples pour un emballage qui correspond exactement à votre produit." }] },
  { id: "sm.steps", page: "surmesure", label: "Le process : étapes (numérotées automatiquement)", mode: "list",
    fields: [T("title", "Titre"), A("text", "Texte")],
    defaults: [
      { title: "Vous décrivez votre besoin", text: "Le produit à emballer, le volume, le budget — un simple échange suffit pour démarrer." },
      { title: "On propose un prototype personnalisé", text: "Format, matière, finition et impression de votre logo, avec un échantillon avant toute production." },
      { title: "Validation & petite série", text: "Dès 500 pièces, pas besoin d'être une grande enseigne pour lancer un format sur mesure." },
    ] },
  { id: "sm.cta", page: "surmesure", label: "Bandeau du bas", mode: "single",
    fields: [T("title", "Titre")], defaults: [{ title: "Un format en tête ?" }] },

  /* ============================ SOLUTIONS & MACHINES ============================ */
  { id: "seo.machines", page: "machines", label: "Google : titre et description", mode: "single", fields: SEO_FIELDS,
    defaults: [{ title: "Machines d'emballage, consommables et solutions intelligentes | Landpack", description: "Landpack propose des machines d'emballage (sous vide, scelleuses de gobelets et de barquettes, mise sous film), les consommables associés (films, sachets, barquettes, couvercles) et des solutions intelligentes (pack complet restaurant, diagnostic emballage, click & collect, anti-fuite, branding) pour la restauration, l'agroalimentaire, les cafés et traiteurs au Maroc." }] },
  { id: "ma.hero", page: "machines", label: "Haut de page", mode: "single",
    fields: [I("image", "Photo"), T("eyebrow", "Petit tampon"), T("title", "Titre"), A("text", "Texte")],
    defaults: [{ image: "/images/solu1.webp", eyebrow: "Machines & Solutions intelligentes",
      title: "Machines, consommables et solutions intelligentes d'emballage.", text: "En complément de nos solutions d'emballage personnalisées, Landpack propose une sélection de machines, équipements et consommables pour la restauration, l'agroalimentaire, les cafés, traiteurs et commerces." }] },
  { id: "ma.machines_head", page: "machines", label: "Petites machines : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), T("title", "Titre")],
    defaults: [{ badge: "Petites machines d'emballage", title: "Au-delà de l'impression." }] },
  { id: "ma.machines", page: "machines", label: "Petites machines : liste", mode: "list",
    fields: [T("title", "Titre"), A("text", "Texte")], defaults: MACHINES },
  { id: "ma.conso_head", page: "machines", label: "Consommables : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), A("text", "Texte")],
    defaults: [{ badge: "Consommables pour machines", text: "Landpack accompagne aussi ses clients avec les consommables nécessaires au fonctionnement des équipements." }] },
  { id: "ma.conso", page: "machines", label: "Consommables : liste", mode: "list",
    fields: [T("title", "Titre"), T("text", "Précision (facultatif)")], defaults: CONSOMMABLES },
  { id: "ma.smart_head", page: "machines", label: "Smart Solutions : titre", mode: "single",
    fields: [T("badge", "Petit tampon"), A("text", "Texte")],
    defaults: [{ badge: "Smart Solutions by Landpack", text: "Pour aller plus loin, Landpack propose des solutions intelligentes et pratiques pour optimiser l'emballage et les opérations quotidiennes." }] },
  { id: "ma.smart", page: "machines", label: "Smart Solutions : liste", mode: "list",
    fields: [T("title", "Titre"), A("text", "Texte")], defaults: SMART },
  { id: "ma.closing", page: "machines", label: "Encadré de conclusion", mode: "single",
    fields: [T("title", "Titre"), T("tags", "Mots-clés (ligne en capitales)"), A("text", "Texte")],
    defaults: [{ title: "Landpack — Une solution globale pour votre emballage",
      tags: "Emballage · Personnalisation · Machines · Consommables · Conseil · Optimisation",
      text: "De l'emballage à la machine, Landpack vous accompagne dans toute votre chaîne de conditionnement." }] },
  { id: "ma.cta", page: "machines", label: "Bandeau du bas", mode: "single",
    fields: [T("title", "Titre")], defaults: [{ title: "Un besoin d'équipement ?" }] },
];

export const DEF_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTION_DEFS.map((d) => [d.id, d]),
);