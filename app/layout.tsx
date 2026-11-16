import type { Metadata } from "next";
import { openingSpec, safeUrl, socialLinks, splitAddress } from "@/lib/shop";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-800.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-500.css";
import "@fontsource/lora/latin-600.css";
import "@fontsource/lora/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-500.css";
import "@fontsource/nunito/latin-700.css";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";
import { getCatalogue, getList, getSettings, getText } from "@/lib/data";
import { themeCss } from "@/lib/theme";

const SITE_URL = "https://landpack.ma";

const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

// Titre, description et mots-clés de l'accueil : modifiables dans l'admin.
export async function generateMetadata(): Promise<Metadata> {
  const [seo, slides, s] = await Promise.all([getText("seo.home"), getList("home.slides"), getSettings()]);
  const shareImage = slides[0]?.image || s.logo_url;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: "%s | Landpack" },
    description: seo.description,
    keywords: (seo.keywords ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    alternates: { canonical: "/" },
    // Vérification Google Search Console par balise (champ « Search Console » de l'admin), seulement si renseigné.
    ...(s.google_verification?.trim() ? { verification: { google: s.google_verification.trim() } } : {}),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      locale: "fr_MA",
      url: SITE_URL,
      siteName: "Landpack",
      title: seo.title,
      description: seo.description,
      images: [{ url: shareImage, alt: "Emballages alimentaires personnalisés Landpack" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [shareImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [s, seo, categories, theme] = await Promise.all([
    getSettings(),
    getText("seo.home"),
    getCatalogue(),
    getText("style.theme"),
  ]);
  const css = themeCss(theme);

  // Le catalogue envoyé à Google est construit à partir du contenu de l'admin :
  // quand le client modifie une catégorie ou un modèle, les données structurées suivent.
  // "Service" et non "Product" : une catégorie regroupe plusieurs modèles à plusieurs prix,
  // ce n'est pas un article unique en vente — Google exige "offers"/"review"/"aggregateRating"
  // pour un "Product", ce qu'une catégorie entière ne peut pas fournir honnêtement.
  const makesOffer = categories.map((c) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: `Personnalisation : ${c.name}`,
      description: `${c.description ?? c.name} Modèles : ${c.items.map((p) => p.dimensions).filter(Boolean).join(" ; ")}.`,
    },
  }));

  // Pages de Landpack ailleurs sur le web (Google Maps, réseaux) : relie le site à ces profils.
  const sameAs = [safeUrl(s.maps_url), ...socialLinks(s).map((x) => x.url)].filter((x): x is string => !!x);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": `${SITE_URL}/#organization`,
    name: "Landpack",
    alternateName: "Landpack Maroc",
    description: seo.description,
    url: SITE_URL,
    logo: absolute(s.logo_url),
    image: absolute(s.logo_url),
    telephone: s.phone,
    ...(s.email ? { email: s.email } : {}),
    founder: { "@type": "Person", name: "Fayesall" },
    currenciesAccepted: "MAD",
    address: {
      "@type": "PostalAddress",
      streetAddress: splitAddress(s.address).street,
      ...(splitAddress(s.address).postalCode ? { postalCode: splitAddress(s.address).postalCode } : {}),
      addressLocality: "Casablanca",
      addressCountry: "MA",
    },
    ...(openingSpec(s) ? { openingHoursSpecification: openingSpec(s) } : {}),
    ...(safeUrl(s.maps_url) ? { hasMap: safeUrl(s.maps_url) } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
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
    makesOffer,
  };

  return (
    <html lang="fr">
      <body className="antialiased">
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
        {children}
        <WhatsAppButton />
        <script
          type="application/ld+json"
          // "<" est échappé : aucun contenu saisi dans l'admin ne peut refermer la balise <script>.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
