import Link from "next/link";
import { getCatalogue, getSettings, getText } from "@/lib/data";
import { formatPhone, telHref, waHref } from "@/lib/format";
import Logo from "./Logo";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

export default async function Footer() {
  const [s, t, categories] = await Promise.all([getSettings(), getText("global.footer"), getCatalogue()]);

  const title = "font-body text-sm font-bold uppercase tracking-[0.12em] text-ink";
  const link = "inline-block py-1.5 font-body text-[15px] text-ink hover:text-water hover:underline";
  const contact = "flex items-start gap-3 py-1.5 font-body text-[15px] text-ink";

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
              <span>{s.address}</span>
            </li>
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
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/15">
        <p className="mx-auto max-w-7xl px-4 pb-20 pt-5 font-body text-sm text-ink-soft sm:px-6 sm:pb-5 lg:px-10">
          © {new Date().getFullYear()} Landpack. {t.note}
        </p>
      </div>
    </footer>
  );
}
