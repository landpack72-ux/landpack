"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/use-account";
import type { MenuCategory } from "./CategoryDropdown";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import Pic from "./Pic";

// Menu « burger » du téléphone : catégories, compte, devis, téléphone.
export default function MobileMenu({
  categories,
  phone,
  phoneHref,
  whatsappHref,
  ctaLabel,
}: {
  categories: MenuCategory[];
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const { profile } = useAccount();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const btnLine = "block rounded-md border border-ink/25 bg-white px-3 py-2.5 text-center font-body text-sm font-semibold text-ink hover:bg-paper";

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu des catégories"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-ink/25 hover:bg-paper"
      >
        <span className="block h-0.5 w-5 bg-ink" />
        <span className="block h-0.5 w-5 bg-ink" />
        <span className="block h-0.5 w-5 bg-ink" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fermer le menu" onClick={close} className="absolute inset-0 bg-black/50" />

          {/* Un seul panneau qui défile : les catégories puis le bloc du bas, sans jamais se chevaucher */}
          <div className="absolute inset-y-0 left-0 flex h-dvh w-[88%] max-w-sm flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-water px-5 py-4 text-cream">
              <p className="font-display text-lg">Catégories</p>
              <button type="button" onClick={close} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center text-3xl leading-none">×</button>
            </div>

            <ul className="shrink-0 divide-y divide-ink/10">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categorie/${c.slug}`} onClick={close} className="flex items-center justify-between gap-3 px-5 py-3 font-body text-[15px] text-ink">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="block h-11 w-11 shrink-0 overflow-hidden rounded border border-ink/10 bg-paper">
                        {c.image_url && <Pic src={c.image_url} alt="" preset="category" sizes="44px" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 font-semibold leading-snug">{c.name}</span>
                    </span>
                    <span aria-hidden className="shrink-0 text-ink-soft">→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto shrink-0 space-y-3 border-t border-ink/15 bg-paper p-4">
              {profile ? (
                <Link href="/compte" onClick={close} className={btnLine}>Mon compte ({profile.first_name || "client"})</Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/compte?tab=connexion" onClick={close} className={btnLine}>Se connecter</Link>
                  <Link href="/compte?tab=inscription" onClick={close} className={btnLine}>Créer un compte</Link>
                </div>
              )}
              <Link href="/panier" onClick={close} className={btnLine}>Mon panier</Link>
              <Link href="/devis" onClick={close} className="block rounded-md bg-kraft px-4 py-3 text-center font-body text-sm font-semibold text-ink hover:bg-kraft-dark">
                {ctaLabel}
              </Link>
              <div className="space-y-1 pt-1">
                <a href={phoneHref} className="flex items-center gap-3 py-2 font-body text-[15px] font-semibold text-ink">
                  <PhoneIcon className="h-5 w-5 shrink-0 text-water" />
                  {phone}
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2 font-body text-[15px] font-semibold text-ink">
                  <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
