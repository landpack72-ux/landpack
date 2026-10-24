import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://landpack.ma";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/personnalisation", "/solutions-machines", "/sur-mesure"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
