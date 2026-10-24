import { getSettings } from "@/lib/data";
import type { Metadata } from "next";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";

const SITE_URL = "https://landpack.ma";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Landpack — Emballage alimentaire personnalisé au Maroc",
    template: "%s | Landpack",
  },
  description:
    "Landpack propose des solutions d'emballage alimentaire personnalisées pour restaurateurs, traiteurs, hôtels, cafés et professionnels de l'alimentaire au Maroc : sacs kraft, boîtes, sachets, gobelets, couverts emballés individuellement, kits de couverts et emballages écoresponsables, imprimés à votre logo. Atelier à Casablanca, livraison dans tout le Maroc.",
  keywords: [
    "emballage alimentaire Maroc",
    "emballage alimentaire Casablanca",
    "solutions d'emballage Maroc",
    "solutions d'emballage sur mesure",
    "emballage restaurateurs traiteurs hôtels",
    "sac kraft personnalisé Maroc",
    "sac kraft personnalisé Casablanca",
    "sac non tissé personnalisé",
    "boîte kraft alimentaire personnalisée",
    "gobelet personnalisé Maroc",
    "gobelet transparent 12oz 14oz 16oz",
    "couverts emballés individuellement",
    "kits de couverts restauration",
    "emballage écoresponsable Maroc",
    "emballage recyclable compostable Maroc",
    "optimisation des coûts d'emballage",
    "impression logo emballage Maroc",
    "packaging alimentaire sur mesure Maroc",
    "fournisseur emballage alimentaire Maroc",
    "machine de conditionnement Maroc",
    "machine de scellage banderolage",
    "machine sous vide Maroc",
    "scelleuse de gobelets Maroc",
    "scelleuse de barquettes Maroc",
    "consommables emballage alimentaire Maroc",
    "film alimentaire sous vide Maroc",
    "barquettes alimentaires Maroc",
    "pack complet restaurant emballage",
    "diagnostic emballage optimisation coûts",
    "solution click and collect emballage",
    "emballage anti-fuite plats en sauce",
    "emballage à emporter personnalisé",
    "Landpack",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: SITE_URL,
    siteName: "Landpack",
    title: "Landpack — Emballage alimentaire personnalisé au Maroc",
    description:
      "Sacs kraft, sacs non tissés, boîtes et gobelets personnalisés à votre logo. Solutions sur mesure et machines de conditionnement. Atelier à Casablanca, livraison dans tout le Maroc.",
    images: [
      {
        url: "/images/tout.webp",
        width: 1500,
        height: 1049,
        alt: "Emballages alimentaires personnalisés Landpack au Maroc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Landpack — Emballage alimentaire personnalisé au Maroc",
    description:
      "Sacs kraft, gobelets et boîtes personnalisés à votre logo. Atelier à Casablanca, livraison dans tout le Maroc.",
    images: ["/images/tout.webp"],
  },
};

const buildJsonLd = (s: Record<string, string>) => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${SITE_URL}/#organization`,
  name: "Landpack",
  alternateName: "Landpack Maroc",
  description:
    "Landpack propose des solutions d'emballage alimentaire personnalisées et adaptées aux besoins des restaurateurs, traiteurs, hôtels, cafés et professionnels de l'alimentaire au Maroc : sacs, boîtes, sachets, gobelets, couverts emballés individuellement, kits de couverts, emballages écoresponsables et solutions sur mesure, imprimés à votre identité visuelle.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.webp`,
  image: `${SITE_URL}/images/tout.webp`,
  telephone: s.phone,
  email: s.email,
  founder: {
    "@type": "Person",
    name: "Fayesall",
  },
  priceRange: "$$",
  currenciesAccepted: "MAD",
  paymentAccepted: "Cash, Bank transfer",
  address: {
    "@type": "PostalAddress",
    streetAddress: s.address.replace(/,?\s*Casablanca$/i, ""),
    addressLocality: "Casablanca",
    addressCountry: "MA",
  },
  areaServed: [
    { "@type": "Country", name: "Maroc" },
    { "@type": "City", name: "Casablanca" },
    { "@type": "City", name: "Rabat" },
    { "@type": "City", name: "Marrakech" },
    { "@type": "City", name: "Tanger" },
    { "@type": "City", name: "Fès" },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: s.phone,
      contactType: "customer service",
      areaServed: "MA",
      availableLanguage: ["fr", "ar"],
    },
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Sacs kraft personnalisés",
        description:
          "Sacs kraft imprimés à votre logo, format 17×26×28, pour restauration à emporter et commerces alimentaires.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Sacs non tissés personnalisés",
        description: "Sacs non tissés réutilisables, personnalisables à votre logo et vos couleurs.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Boîtes kraft alimentaires personnalisées",
        description: "Boîtes kraft pour repas à emporter, robustes et personnalisables.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Gobelets transparents personnalisés",
        description: "Gobelets transparents 12oz, 14oz et 16oz, imprimés à votre logo.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Emballages sur mesure",
        description:
          "Développement de formats d'emballage sur mesure : prototypes, dimensions et matières adaptées au produit.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Solutions et machines de conditionnement",
        description:
          "Machines de scellage, banderolage et étiquetage choisies et installées pour accompagner vos emballages.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Couverts emballés individuellement",
        description: "Solutions hygiéniques et pratiques pour la restauration.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Kits de couverts",
        description:
          "Assemblages comprenant couverts, serviette, sel, poivre et autres accessoires selon les besoins.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Emballages alimentaires sécurisés",
        description:
          "Solutions conçues pour garantir l'hygiène, la protection et la bonne conservation des aliments.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Optimisation des coûts d'emballage",
        description:
          "Accompagnement pour réduire les frais d'emballage tout en conservant qualité et présentation.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Conseil et orientation packaging",
        description:
          "Aide au choix de l'emballage le plus adapté à chaque produit, à l'activité et au budget du client.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Solutions d'emballage écoresponsables",
        description:
          "Sélection d'emballages recyclables, compostables ou fabriqués à partir de matériaux plus responsables.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Échantillonnage et validation",
        description: "Possibilité de tester les formats et solutions avant la production.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Machines sous vide",
        description: "Pour prolonger la conservation et protéger les produits alimentaires.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Machines à sceller les gobelets",
        description:
          "Pour gobelets en carton et en plastique, adaptées aux boissons froides et chaudes selon le modèle.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Scelleuses de barquettes",
        description: "Pour fermer hermétiquement les barquettes alimentaires et faciliter le transport.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Machines de mise sous film",
        description: "Pour protéger et présenter différents produits alimentaires.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Consommables pour machines d'emballage",
        description:
          "Rouleaux de film, films pour scelleuses de gobelets et barquettes, sachets sous vide, films alimentaires, couvercles et accessoires.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Pack complet restaurant",
        description: "Machine + emballages + consommables + accompagnement.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Diagnostic emballage",
        description: "Analyse des emballages actuels afin d'identifier les possibilités d'optimisation.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Solution Click & Collect / livraison",
        description: "Emballages adaptés au transport, à la conservation et à la présentation.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Solution anti-fuite",
        description:
          "Choix d'emballages et de systèmes de fermeture adaptés aux plats en sauce et aux boissons.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Solution branding",
        description: "Emballages, gobelets, sacs et accessoires personnalisés à l'image de la marque du client.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Accompagnement technique machines",
        description: "Conseil pour le choix, l'utilisation et l'entretien des équipements.",
      },
    },
  ],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <WhatsAppButton />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(settings)) }}
        />
      </body>
    </html>
  );
}
