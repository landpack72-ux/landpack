import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/data";

const SITE_URL = "https://landpack.ma";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCatalogue();
  const urls: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/devis", priority: 0.6 },
    ...categories.map((c) => ({ path: `/categorie/${c.slug}`, priority: 0.9 })),
    ...categories.flatMap((c) =>
      c.items.flatMap((p) => (p.id ? [{ path: `/produit/${p.id}`, priority: 0.7 }] : [])),
    ),
  ];
  return urls.map((u) => ({
    url: `${SITE_URL}${u.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: u.priority,
  }));
}
