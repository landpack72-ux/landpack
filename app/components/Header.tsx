import Link from "next/link";
import { getCatalogue, getSettings, getText } from "@/lib/data";
import { formatPhone, telHref, waHref } from "@/lib/format";
import Logo from "./Logo";
import HeaderSearch from "./HeaderSearch";
import CategoryDropdown from "./CategoryDropdown";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";
import CartButton from "./CartButton";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export default async function Header() {
  const [s, categories, header] = await Promise.all([getSettings(), getCatalogue(), getText("global.header")]);

  const menu = categories.map((c) => ({ slug: c.slug, name: c.name, image_url: c.image_url }));
  const entries = categories.flatMap((c) =>
    c.items.map((p, i) => ({
      id: p.id ?? `${c.slug}-${i + 1}`,
      name: p.name,
      dimensions: p.dimensions,
      category: c.name,
      slug: c.slug,
    })),
  );

  return (
    <header className="bg-white">
      {header.tagline && (
        <p className="bg-kraft px-4 py-2.5 text-center font-display text-[13px] font-bold leading-snug tracking-wide text-ink sm:text-[15px]">
          {header.tagline}
        </p>
      )}

      {/* ORDINATEUR : logo, puis barre verte (catégories, recherche, compte, devis) */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-3">
          <Link href="/" aria-label="Landpack, accueil" className="shrink-0">
            <Logo src={s.logo_url} className="h-28 w-auto" />
          </Link>
          <div className="flex items-center gap-12 xl:gap-16">
            <a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block font-body text-xs text-ink-soft">Écrivez-nous</span>
                <span className="block font-body text-lg font-semibold text-ink group-hover:text-water">WhatsApp</span>
              </span>
            </a>
            <a href={telHref(s.phone)} className="group flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-water text-cream">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-body text-xs text-ink-soft">Appelez-nous</span>
                <span className="block font-body text-lg font-semibold text-ink group-hover:text-water">{formatPhone(s.phone)}</span>
              </span>
            </a>
          </div>
        </div>
        <div className="bg-water">
          <div className="mx-auto flex max-w-7xl items-center gap-5 px-10 py-2.5">
            <CategoryDropdown categories={menu} />
            <div className="min-w-0 flex-1">
              <HeaderSearch entries={entries} tone="bar" />
            </div>
            <AccountMenu variant="bar" />
            <CartButton variant="bar" />
            <Link
              href="/devis"
              className="shrink-0 rounded-md bg-kraft px-5 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-kraft-dark"
            >
              {header.cta_label}
            </Link>
          </div>
        </div>
      </div>

      {/* TÉLÉPHONE : burger, logo, compte ; puis la recherche */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <MobileMenu
            categories={menu}
            phone={formatPhone(s.phone)}
            phoneHref={telHref(s.phone)}
            whatsappHref={waHref(s.whatsapp)}
            ctaLabel={header.cta_label}
          />
          <Link href="/" aria-label="Landpack, accueil" className="flex min-w-0 shrink justify-center">
            <Logo src={s.logo_url} className="h-16 w-auto max-w-full object-contain" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <CartButton variant="mobile" />
            <AccountMenu variant="mobile" />
          </div>
        </div>
        <div className="bg-water px-4 py-2.5">
          <HeaderSearch entries={entries} tone="bar" />
        </div>
      </div>
    </header>
  );
}
