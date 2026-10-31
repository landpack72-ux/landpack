import type { Metadata } from "next";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
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
import { getLayout, getList, getProducts, getSettings, getText } from "@/lib/data";
import { themeCss } from "@/lib/theme";

const SITE_URL = "https://landpack.ma";

// Titre, description et mots-clés de l'accueil : modifiables dans l'admin.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getText("seo.home");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: "%s | Landpack" },
    description: seo.description,
    keywords: (seo.keywords ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    alternates: { canonical: "/" },
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
      images: [
        { url: "/images/tout.webp", width: 1500, height: 1049, alt: "Emballages alimentaires personnalisés Landpack au Maroc" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/tout.webp"],
    },
  };
}

type Offer = { "@type": "Offer"; itemOffered: { "@type": string; name: string; description: string } };
const offer = (type: "Product" | "Service", name: string, description: string): Offer => ({
  "@type": "Offer",
  itemOffered: { "@type": type, name, description },
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [s, seo, products, solutions, machines, conso, smart, theme, layout] = await Promise.all([
    getSettings(),
    getText("seo.home"),
    getProducts(),
    getList("home.solutions"),
    getList("ma.machines"),
    getList("ma.conso"),
    getList("ma.smart"),
    getText("style.theme"),
    getLayout(),
  ]);
  const css = themeCss(theme);

  // Le catalogue envoyé à Google est construit à partir du contenu de l'admin :
  // quand le client modifie un produit ou une solution, les données structurées suivent.
  const makesOffer: Offer[] = [
    ...products.map((p) => offer("Product", p.name, p.description ?? "")),
    // La liste « Nos solutions » n'est envoyée à Google que si la section est affichée sur le site.
    ...(layout.solutions ? solutions.map((x) => offer("Service", x.title, x.text ?? "")) : []),
    ...machines.map((x) => offer("Product", x.title, x.text ?? "")),
    offer("Product", "Consommables pour machines d'emballage", conso.map((x) => x.title).join(", ")),
    ...smart.map((x) => offer("Service", x.title, x.text ?? "")),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": `${SITE_URL}/#organization`,
    name: "Landpack",
    alternateName: "Landpack Maroc",
    description: seo.description,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.webp`,
    image: `${SITE_URL}/images/tout.webp`,
    telephone: s.phone,
    email: s.email,
    founder: { "@type": "Person", name: "Fayesall" },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
