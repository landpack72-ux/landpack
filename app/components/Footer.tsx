import { getSettings } from "@/lib/data";
import { formatPhone, telHref, waHref } from "@/lib/format";
import LandpackLogo from "./LandpackLogo";

const YEAR = new Date().getFullYear();

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer className="bg-water-dark px-4 sm:px-6 pb-8 pt-14 sm:pt-16 text-cream lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <LandpackLogo size={34} />
              <span className="font-display text-2xl inline-block">
                <span className="text-nature-light">Land</span>
                <span className="text-gold">pack</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs font-body text-sm text-cream/70">
              Emballages alimentaires personnalisés — sacs kraft et gobelets
              transparents imprimés à Casablanca.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-cream/50">
              Produits
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-cream/80">
              <li><a href="/personnalisation" className="hover:text-gold">Sacs kraft</a></li>
              <li><a href="/personnalisation" className="hover:text-gold">Sacs non tissés</a></li>
              <li><a href="/personnalisation" className="hover:text-gold">Boîtes kraft</a></li>
              <li><a href="/personnalisation" className="hover:text-gold">Gobelets</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-cream/50">
              Atelier
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-cream/80">
              <li>{s.address}</li>
              <li>
                <a href={`mailto:${s.email}`} className="hover:text-gold">
                  {s.email}
                </a>
              </li>
              <li>
                <a href={telHref(s.phone)} className="hover:text-gold">
                  {formatPhone(s.phone)}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-cream/50">
              Suivez l&apos;atelier
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-cream/80">
              <li><a href="#" className="hover:text-gold">Instagram</a></li>
              <li><a href="#" className="hover:text-gold">Facebook</a></li>
              <li><a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t-2 border-dashed border-cream/20 pt-6 font-mono text-xs text-cream/50 sm:flex-row sm:items-center">
          <p>© {YEAR} Landpack. Tous droits réservés.</p>
          <p>Imprimé avec soin, un tampon à la fois.</p>
        </div>
      </div>
    </footer>
  );
}
