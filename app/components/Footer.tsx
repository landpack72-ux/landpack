import Link from "next/link";
import { getCatalogue, getSettings, getText } from "@/lib/data";
import { formatPhone, telHref, waHref } from "@/lib/format";
import { hoursText, safeUrl, socialLinks } from "@/lib/shop";
import Logo from "./Logo";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

export default async function Footer() {
  const [s, t, categories] = await Promise.all([getSettings(), getText("global.footer"), getCatalogue()]);

  const title = "font-body text-sm font-bold uppercase tracking-[0.12em] text-ink";
  const link = "inline-block py-1.5 font-body text-[15px] text-ink hover:text-water hover:underline";
  const contact = "flex items-start gap-3 py-1.5 font-body text-[15px] text-ink";
  const hours = hoursText(s);
  const mapsUrl = safeUrl(s.maps_url);
  const socials = socialLinks(s);

  return (
    <footer className="mt-10 border-t-4 border-kraft bg-[#f0efeb] text-ink sm:mt-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-3 lg:px-10">
        <div>
          <Logo src={s.logo_url} className="h-24 w-auto" />
          <p className="mt-4 max-w-xs font-body text-[15px] leading-relaxed text-ink-soft">{t.tagline}</p>
        </div>

        <div>
          <p className={title}>{t.products_title}</p>
          <span className="mt-2 block h-0.5 w-10 bg-kraft" />
          <ul className="mt-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${c.slug}`} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/devis" className={link}>Demander un devis</Link>
            </li>
            <li>
              <Link href="/compte" className={link}>Mon compte</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className={title}>{t.contact_title}</p>
          <span className="mt-2 block h-0.5 w-10 bg-kraft" />
          <ul className="mt-3">
            <li className={contact}>
              <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-water" />
              <span>
                {s.address}
                {s.shop_landmarks?.trim() && <span className="mt-0.5 block text-sm text-ink-soft">{s.shop_landmarks.trim()}</span>}
              </span>
            </li>
            {hours && (
              <li className="py-1.5 pl-8 font-body text-[15px] text-ink">
                <span className="font-semibold">Boutique ouverte</span>
                <span className="block text-ink-soft">{hours.charAt(0).toUpperCase() + hours.slice(1)}</span>
              </li>
            )}
            {mapsUrl && (
              <li className="pl-8">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 font-body text-[15px] font-semibold text-water underline hover:text-water-dark">
                  Voir sur Google Maps
                </a>
              </li>
            )}
            <li>
              <a href={telHref(s.phone)} className={`${contact} hover:text-water`}>
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-water" />
                <span className="font-semibold">{formatPhone(s.phone)}</span>
              </a>
            </li>
            <li>
              <a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer" className={`${contact} hover:text-water`}>
                <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                <span className="font-semibold">WhatsApp</span>
              </a>
            </li>
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className={`${contact} hover:text-water`}>
                  <span>{s.email}</span>
                </a>
              </li>
            )}
            {socials.length > 0 && (
              <li className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
                {socials.map((x) => (
                  <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer me" className="py-1.5 font-body text-[15px] font-semibold text-ink hover:text-water hover:underline">
                    {x.label}
                  </a>
                ))}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-20 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-5 lg:px-10">
          <p className="font-body text-sm text-ink-soft">
            © {new Date().getFullYear()} Landpack. {t.note}
          </p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-1 font-body text-sm text-ink-soft">
            <Link href="/confidentialite" className="py-1 hover:text-water hover:underline">Confidentialité et cookies</Link>
            <Link href="/mentions-legales" className="py-1 hover:text-water hover:underline">Mentions légales</Link>
            {s.legal_cgv_published === "1" && <Link href="/conditions-de-vente" className="py-1 hover:text-water hover:underline">Conditions de vente</Link>}
          </nav>
        </div>
      </div>
    </footer>
  );
}
