import type { Metadata } from "next";

// Métadonnées d'une sous-page (titre, description, partage sur les réseaux).
export function pageMetadata(
  path: string,
  seo: Record<string, string>,
  image = "/images/tout.webp",
): Metadata {
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "fr_MA",
      siteName: "Landpack",
      url: path,
      title: seo.title,
      description: seo.description,
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [image] },
  };
}
