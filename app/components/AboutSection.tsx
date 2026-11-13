import Link from "next/link";
import { fmtInt, type PricingRules } from "@/lib/pricing";
import { hoursSentence, safeUrl } from "@/lib/shop";

// Présentation de Landpack (bas de l'accueil) : un texte pour les visiteurs et pour Google, mis en page comme le reste du site.
// Le titre et le texte se modifient dans l'admin (Accueil & style). Si le titre est vide, le bloc disparaît.
export default function AboutSection({
  title, text, rules, settings,
}: { title: string; text: string; rules: PricingRules; settings: Record<string, string> }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const hours = hoursSentence(settings);
  const landmarks = settings.shop_landmarks?.trim();
  const mapsUrl = safeUrl(settings.maps_url);

  const facts: { title: string; text: string }[] = [
    {
      title: "Votre logo sur chaque emballage",
      text: `Boîtes, sachets, sacs kraft, gobelets et cartons imprimés à votre marque, à partir de ${fmtInt(rules.qtyMin)} pièces selon le modèle.`,
    },
    {
      title: "Livraison partout au Maroc",
      text: "Commandez en ligne, par téléphone ou sur WhatsApp : nous confirmons chaque commande par un appel avant l'impression.",
    },
    {
      title: "Notre boutique",
      text: `${settings.address}.${landmarks ? ` ${landmarks}.` : ""}${hours ? ` ${hours}.` : ""}`,
    },
  ];

  return (
    <section aria-labelledby="presentation" className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <div className="overflow-hidden rounded-md border border-ink/10 bg-paper">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0 border-t-4 border-kraft p-6 sm:p-10 lg:border-t-0 lg:border-l-4">
            <h2 id="presentation" className="font-display text-2xl leading-tight text-ink [overflow-wrap:anywhere] sm:text-3xl">
              {title}
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-kraft" />
            <div className="mt-5 max-w-2xl space-y-4 font-body text-[15px] leading-relaxed text-ink-soft [overflow-wrap:anywhere] sm:text-base">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/devis"
                className="inline-block rounded-md bg-water px-6 py-3 font-body text-sm font-semibold text-cream transition-colors hover:bg-water-dark"
              >
                Demander un devis
              </Link>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md border border-ink/25 bg-white px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-cream"
                >
                  Voir sur Google Maps
                </a>
              )}
            </div>
          </div>

          <ul className="min-w-0 space-y-5 border-t border-ink/10 bg-white p-6 sm:p-10 lg:border-l lg:border-t-0">
            {facts.map((f) => (
              <li key={f.title} className="border-l-4 border-kraft pl-4">
                <p className="font-body text-sm font-semibold text-ink">{f.title}</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-ink-soft [overflow-wrap:anywhere]">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
