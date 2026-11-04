"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CartIcon } from "./icons";

// Icône de panier de l'en-tête : le badge indique le nombre d'articles ajoutés.
export default function CartButton({ variant }: { variant: "bar" | "mobile" }) {
  const lines = useCart();
  const n = lines.length;
  const label = n === 0 ? "Panier vide" : `Panier : ${n} article${n > 1 ? "s" : ""}`;

  const badge =
    n > 0 ? (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-kraft px-1 font-body text-[11px] font-bold leading-none text-ink ring-2 ring-white">
        {n}
      </span>
    ) : null;

  if (variant === "mobile") {
    return (
      <Link
        href="/panier"
        aria-label={label}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ink/25 text-ink hover:bg-paper"
      >
        <CartIcon className="h-6 w-6" />
        {badge}
      </Link>
    );
  }

  return (
    <Link
      href="/panier"
      aria-label={label}
      className="flex shrink-0 items-center gap-2.5 rounded-md px-2 py-1 text-cream transition-colors hover:bg-white/10"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream/40">
        <CartIcon className="h-6 w-6" />
        {n > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-kraft px-1 font-body text-[11px] font-bold leading-none text-ink ring-2 ring-water">
            {n}
          </span>
        )}
      </span>
      <span className="leading-tight">
        <span className="block font-body text-xs text-cream/85">Mon</span>
        <span className="block font-body text-sm font-semibold">Panier</span>
      </span>
    </Link>
  );
}
