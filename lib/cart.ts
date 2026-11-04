"use client";

// Panier du visiteur, gardé dans son navigateur (localStorage). Il ne contient aucune donnée sensible :
// des articles, des quantités et les NOMS des fichiers déjà envoyés dans le stockage privé.
// Les prix et le total sont recalculés par le serveur au moment de la commande.

import { useSyncExternalStore } from "react";
import { LOGO_PATH } from "./lead-clean";

export type CartLine = {
  key: string;
  id: string; // identifiant de l'article
  title: string;
  category: string;
  image: string | null;
  unit_price: number | null; // prix vu au moment de l'ajout (recalculé ensuite)
  min_qty: number | null;
  qty: number;
  logoPath: string;
  logoThumb: string | null;
  photoPath: string | null;
  note: string;
};

const KEY = "lp_cart_v1";
const EVENT = "lp-cart-changed";
const EMPTY: CartLine[] = [];

function isLine(l: unknown): l is CartLine {
  const x = l as Partial<CartLine> | null;
  return (
    !!x &&
    typeof x.key === "string" &&
    typeof x.id === "string" &&
    typeof x.title === "string" &&
    Number.isInteger(x.qty) &&
    typeof x.logoPath === "string" &&
    LOGO_PATH.test(x.logoPath)
  );
}

let cachedRaw: string | null | undefined;
let cachedLines: CartLine[] = EMPTY;

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* stockage indisponible */
  }
  if (raw === cachedRaw) return cachedLines; // même référence tant que rien n'a changé
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedLines = Array.isArray(parsed) ? parsed.filter(isLine).slice(0, 30) : EMPTY;
  } catch {
    cachedLines = EMPTY;
  }
  return cachedLines;
}

function write(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* quota dépassé : on continue sans enregistrer */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Le contenu du panier, mis à jour automatiquement partout sur le site. */
export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getCart, () => EMPTY);
}

export function addLine(line: Omit<CartLine, "key">) {
  write([...getCart(), { ...line, key: crypto.randomUUID() }].slice(-30));
}
export function setLineQty(key: string, qty: number) {
  write(getCart().map((l) => (l.key === key ? { ...l, qty } : l)));
}
export function removeLine(key: string) {
  write(getCart().filter((l) => l.key !== key));
}
export function clearCart() {
  write([]);
}
