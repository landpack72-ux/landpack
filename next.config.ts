import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Adresse de ton projet Supabase (les images et l'envoi des demandes en ont besoin).
let supabase = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
} catch {
  /* adresse invalide : ignorée */
}

// Politique de sécurité du contenu : le navigateur refuse tout ce qui ne vient pas de
// ces origines. Même si du code malveillant s'exécutait dans une page, il ne pourrait
// ni charger un script externe, ni envoyer de données vers un autre site.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabase}`.trim(),
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Les pages déjà visitées sont gardées 30 s par le navigateur (5 min par défaut) : une photo modifiée apparaît vite.
  experimental: { staleTimes: { dynamic: 0, static: 30 } },
  images: {
    unoptimized: true,
  },
  // Anciennes pages supprimées : on renvoie les visiteurs (et Google) vers l'accueil.
  async redirects() {
    return ["/personnalisation", "/solutions-machines", "/sur-mesure"].map((source) => ({
      source,
      destination: "/",
      permanent: true,
    }));
  },
  async headers() {
    if (!isProd) return []; // en développement, ces règles gêneraient le rechargement à chaud
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
