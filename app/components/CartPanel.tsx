"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { clearCart, removeLine, setLineQty, useCart, type CartLine } from "@/lib/cart";
import { computeTotals, isValidQty, money, piecesLabel, snapQty, type PricingRules, fmtInt } from "@/lib/pricing";
import { useAccount } from "@/lib/use-account";
import Pic from "./Pic";

type PricingData = {
  rules: PricingRules;
  products: Record<string, { unit_price: number | null; min_qty: number; title: string; category: string; slug: string }>;
};

const DEFAULT_RULES: PricingRules = { qtyMin: 50, qtyStep: 50, discountThreshold: 1000, discountPercent: 15 };

const field =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 font-body text-sm text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none";
const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";

export default function CartPanel() {
  const lines = useCart();
  const { profile } = useAccount();
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [problem, setProblem] = useState("");
  const [done, setDone] = useState<{ total: number; pieces: number; discountPercent: number; articles: number } | null>(null);

  // Prix et règles actuels du site (le panier garde seulement ce qui a été vu à l'ajout)
  useEffect(() => {
    let alive = true;
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && setPricing(j as PricingData))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const rules = pricing?.rules ?? DEFAULT_RULES;

  // Chaque ligne avec son prix et sa quantité minimale à jour
  const view = useMemo(
    () =>
      lines.map((l: CartLine) => {
        const fresh = pricing?.products[l.id];
        const unavailable = !!pricing && !fresh;
        const unit = fresh ? fresh.unit_price : l.unit_price;
        const min = fresh ? fresh.min_qty : (l.min_qty ?? rules.qtyMin);
        return { line: l, unit, min, unavailable, slug: fresh?.slug };
      }),
    [lines, pricing, rules.qtyMin],
  );
  const usable = view.filter((v) => !v.unavailable);
  const totals = computeTotals(usable.map((v) => ({ unit_price: v.unit, qty: v.line.qty })), rules);
  const hasUnavailable = view.some((v) => v.unavailable);
  const hasBadQty = usable.some((v) => !isValidQty(v.line.qty, v.min, rules.qtyStep));
  const missing = rules.discountThreshold - totals.pieces;
  const k = profile ? "compte" : "visiteur";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasUnavailable || hasBadQty) {
      setProblem("Corrigez d'abord votre panier : un article n'est plus disponible ou une quantité n'est plus valable.");
      return;
    }
    setStatus("sending");
    setProblem("");
    const d = new FormData(e.currentTarget);
    const get = (n: string) => String(d.get(n) ?? "");
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: get("first_name"),
          last_name: get("last_name"),
          phone: get("phone"),
          address: get("address"),
          message: get("message"),
          website: get("website"),
          items: lines.map((l) => ({ id: l.id, qty: l.qty, logo_path: l.logoPath, photo_path: l.photoPath, note: l.note })),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setDone({ total: j.total ?? totals.total, pieces: j.pieces ?? totals.pieces, discountPercent: j.discountPercent ?? 0, articles: j.articles ?? lines.length });
        clearCart();
        setStatus("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setProblem(j.error ?? "Un problème est survenu : vérifiez vos informations et réessayez.");
    } catch {
      setProblem("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
    setStatus("idle");
  }

  if (status === "done" && done) {
    return (
      <div className="mx-auto max-w-xl rounded-md border border-ink/10 bg-paper p-8 text-center">
        <p className="font-display text-2xl text-ink">Commande envoyée</p>
        <p className="mt-3 font-body text-ink-soft">
          Merci ! Votre commande de {piecesLabel(done.pieces)} ({done.articles} article{done.articles > 1 ? "s" : ""}) est bien reçue.
        </p>
        <p className="mt-4 font-body text-sm text-ink">
          Total :{" "}
          <span className="font-display text-2xl">{money(done.total)}</span>
          {done.discountPercent > 0 && <span className="block text-sm text-water">dont une remise de {done.discountPercent} %</span>}
        </p>
        <p className="mt-4 font-body text-sm text-ink-soft">
          Nous vous appelons très vite pour confirmer la commande, valider vos logos et convenir de la livraison.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {profile && (
            <Link href="/compte" className="rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">
              Voir mes commandes
            </Link>
          )}
          <Link href="/" className="rounded-md border border-ink/25 bg-white px-5 py-2.5 font-body text-sm font-semibold text-ink hover:bg-paper">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-md border border-ink/10 bg-white p-8 text-center sm:p-12">
        <p className="font-display text-xl text-ink">Votre panier est vide</p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm text-ink-soft">
          Choisissez un article, chargez votre logo et ajoutez-le au panier : vous retrouverez ici le prix total de votre commande.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-water px-6 py-3 font-body text-sm font-semibold text-cream hover:bg-water-dark">
          Voir les catégories
        </Link>
      </div>
    );
  }

  const stepBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ink/25 bg-white font-body text-lg font-semibold text-ink hover:bg-paper disabled:opacity-40";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      {/* Articles */}
      <section aria-label="Articles du panier" className="min-w-0">
        <ul className="space-y-4">
          {view.map(({ line: l, unit, min, unavailable, slug }) => {
            const lineTotal = unit != null ? unit * l.qty : null;
            return (
              <li key={l.key} className={`rounded-md border bg-white p-4 sm:p-5 ${unavailable ? "border-red-300" : "border-ink/10"}`}>
                <div className="flex gap-4">
                  <span className="block h-20 w-20 shrink-0 overflow-hidden rounded border border-ink/10 bg-paper sm:h-24 sm:w-24">
                    {l.image && <Pic src={l.image} alt="" preset="product" sizes="96px" className="h-full w-full object-contain p-1.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-water">{l.category}</p>
                    <h2 className="font-body text-base font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
                      <Link href={`/produit/${l.id}`} className="hover:underline">{l.title}</Link>
                    </h2>
                    {unavailable ? (
                      <p className="mt-1 font-body text-sm font-semibold text-red-700">Cet article n&apos;est plus disponible : retirez-le.</p>
                    ) : (
                      <p className="mt-1 font-body text-sm text-ink-soft">{unit != null ? `${money(unit)} par pièce` : "Prix sur devis"}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs text-ink-soft">
                      <span>Votre logo :</span>
                      {l.logoThumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.logoThumb} alt="Votre logo" className="h-9 w-auto max-w-20 rounded border border-ink/10 bg-white p-0.5" />
                      ) : (
                        <span className="font-semibold text-ink">envoyé ✓</span>
                      )}
                      {l.photoPath && <span>· photo de l&apos;article jointe</span>}
                    </div>
                    {l.note && <p className="mt-1 font-body text-xs text-ink-soft [overflow-wrap:anywhere]">Précisions : {l.note}</p>}
                  </div>
                </div>

                {!unavailable && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className={stepBtn} aria-label="Diminuer la quantité" disabled={l.qty <= min} onClick={() => setLineQty(l.key, snapQty(l.qty - rules.qtyStep, min, rules.qtyStep))}>−</button>
                      <input
                        key={l.qty}
                        inputMode="numeric"
                        aria-label={`Quantité de ${l.title}`}
                        defaultValue={l.qty}
                        onBlur={(e) => setLineQty(l.key, snapQty(Number(e.target.value.replace(/\D/g, "") || min), min, rules.qtyStep))}
                        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), e.preventDefault())}
                        className="h-9 w-20 rounded-md border border-ink/25 sm:w-24 bg-white px-2 text-center font-body text-sm font-semibold text-ink focus:border-water focus:outline-none"
                      />
                      <button type="button" className={stepBtn} aria-label="Augmenter la quantité" onClick={() => setLineQty(l.key, snapQty(l.qty + rules.qtyStep, min, rules.qtyStep))}>+</button>
                      <span className="font-body text-xs text-ink-soft">pièces</span>
                    </div>
                    <p className="font-display text-lg text-ink">{lineTotal != null ? money(lineTotal) : "sur devis"}</p>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  {!unavailable && <p className="font-body text-xs text-ink-soft">Minimum {min} pièces, par paliers de {rules.qtyStep}.</p>}
                  <div className="ml-auto flex gap-4">
                    {slug && <Link href={`/produit/${l.id}`} className="inline-block py-1.5 font-body text-sm font-semibold text-water hover:underline">Voir l&apos;article</Link>}
                    <button type="button" onClick={() => removeLine(l.key)} className="inline-block py-1.5 font-body text-sm font-semibold text-ink underline hover:text-red-700">
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/" className="mt-5 inline-block py-2 font-body text-sm font-semibold text-water hover:underline">← Continuer mes achats</Link>
      </section>

      {/* Total et commande */}
      <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
        <section aria-label="Total de la commande" className="rounded-md border border-ink/10 bg-paper p-5">
          <h2 className="font-display text-lg text-ink">Total de la commande</h2>
          <dl className="mt-3 space-y-1.5 font-body text-sm text-ink" aria-live="polite">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Quantité totale</dt>
              <dd className="font-semibold">{piecesLabel(totals.pieces)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Sous-total</dt>
              <dd className="font-semibold">{money(totals.subtotal)}</dd>
            </div>
            {totals.discountPercent > 0 && (
              <div className="flex justify-between gap-3 text-water">
                <dt>Remise de {totals.discountPercent} % (dès {fmtInt(rules.discountThreshold)} pièces)</dt>
                <dd className="font-semibold">− {money(totals.discountAmount)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-ink/15 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl">{money(totals.total)}</dd>
            </div>
          </dl>
          {totals.unpriced > 0 && <p className="mt-2 font-body text-xs text-ink-soft">{totals.unpriced} article(s) sur devis ne sont pas comptés : nous vous donnons leur prix par téléphone.</p>}
          {rules.discountThreshold > 0 && rules.discountPercent > 0 && missing > 0 && (
            <p className="mt-3 rounded bg-kraft/40 px-3 py-2 font-body text-xs font-semibold text-ink">
              Encore {fmtInt(missing)} pièces pour obtenir −{rules.discountPercent} % sur toute la commande.
            </p>
          )}
        </section>

        <form onSubmit={submit} className="relative space-y-4 rounded-md border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg text-ink">Vos coordonnées</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-first" className={label}>Prénom</label>
              <input key={`f-${k}`} id="p-first" name="first_name" required maxLength={80} autoComplete="given-name" defaultValue={profile?.first_name ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="p-last" className={label}>Nom</label>
              <input key={`l-${k}`} id="p-last" name="last_name" required maxLength={80} autoComplete="family-name" defaultValue={profile?.last_name ?? ""} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="p-phone" className={label}>Téléphone</label>
            <input key={`p-${k}`} id="p-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={6} maxLength={40} defaultValue={profile?.phone ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="p-address" className={label}>Adresse de livraison</label>
            <textarea key={`a-${k}`} id="p-address" name="address" rows={2} required maxLength={300} autoComplete="street-address" defaultValue={profile?.address ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="p-msg" className={label}>Précisions (facultatif)</label>
            <textarea id="p-msg" name="message" rows={2} maxLength={1000} className={field} />
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="p-website">Ne pas remplir</label>
            <input id="p-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <p className="font-body text-xs text-ink-soft">
            {profile ? (
              "Connecté : cette commande sera ajoutée à votre compte."
            ) : (
              <>
                Déjà client ? <Link href="/compte?tab=connexion" className="font-semibold text-water underline">Se connecter</Link> pour préremplir.
              </>
            )}{" "}
            Nous vous appelons pour confirmer la commande, valider vos logos et convenir de la livraison.
          </p>
          {problem && <p className="font-body text-sm text-red-700">{problem}</p>}
          <button
            type="submit"
            disabled={status === "sending" || hasUnavailable}
            className="w-full rounded-md bg-water px-4 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60"
          >
            {status === "sending" ? "Envoi en cours…" : `Envoyer ma commande · ${money(totals.total)}`}
          </button>
        </form>
      </aside>
    </div>
  );
}
