"use client";

import Link from "next/link";
import { useState } from "react";
import { addLine } from "@/lib/cart";
import { makeThumb } from "@/lib/image-client";
import { uploadCustomerLogo, uploadCustomerPhoto } from "@/lib/leads";
import { computeTotals, isValidQty, money, piecesLabel, quickQuantities, snapQty, type PricingRules, fmtInt } from "@/lib/pricing";
import FileField from "./FileField";

export type PurchaseProduct = {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string | null;
  unit_price: number | null;
  min_qty: number;
};

const field =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 font-body text-sm text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none";
const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";

/**
 * Achat d'un article : quantité par paliers (50, 100, 150...), prix total avec remise automatique,
 * logo à charger, puis « Ajouter au panier ».
 */
export default function ProductPurchase({ product, rules }: { product: PurchaseProduct; rules: PricingRules }) {
  const { min_qty: min } = product;
  const step = rules.qtyStep;
  const [qty, setQty] = useState(min);
  const [typed, setTyped] = useState(String(min));
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [added, setAdded] = useState(false);

  const totals = computeTotals([{ unit_price: product.unit_price, qty }], rules);
  const unit = product.unit_price;
  const missing = rules.discountThreshold - qty;
  const quick = quickQuantities(min, rules);

  function setQuantity(next: number) {
    const q = snapQty(next, min, step);
    setQty(q);
    setTyped(String(q));
    setAdded(false);
  }
  function pickLogo(f: File | null) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogo(f);
    setLogoPreview(f ? URL.createObjectURL(f) : null);
    setProblem("");
    setAdded(false);
  }
  function pickPhoto(f: File | null) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(f);
    setPhotoPreview(f ? URL.createObjectURL(f) : null);
  }

  async function add() {
    if (!logo) {
      setProblem("Ajoutez votre logo : c'est lui que nous imprimons sur votre article.");
      return;
    }
    if (!isValidQty(qty, min, step)) {
      setQuantity(qty);
      return;
    }
    setBusy(true);
    setProblem("");
    try {
      const logoPath = await uploadCustomerLogo(logo);
      const photoPath = photo ? await uploadCustomerPhoto(photo) : null;
      const logoThumb = await makeThumb(logo);
      addLine({
        id: product.id,
        title: product.title,
        category: product.category,
        image: product.image,
        unit_price: product.unit_price,
        min_qty: product.min_qty,
        qty,
        logoPath,
        logoThumb,
        photoPath,
        note: note.trim().slice(0, 500),
      });
      setAdded(true);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "L'ajout au panier a échoué. Réessayez.");
    }
    setBusy(false);
  }

  const stepBtn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ink/25 bg-white font-body text-xl font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-40";

  return (
    <div className="space-y-5">
      {/* Quantité */}
      <div>
        <span className={label}>Quantité</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <button type="button" className={stepBtn} aria-label={`Diminuer de ${step} pièces`} disabled={qty <= min} onClick={() => setQuantity(qty - step)}>
            −
          </button>
          <input
            inputMode="numeric"
            aria-label="Quantité en pièces"
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
            onBlur={() => setQuantity(Number(typed || min))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), setQuantity(Number(typed || min)))}
            className="h-11 w-24 rounded-md border sm:w-28  border-ink/25 bg-white px-3 text-center font-body text-base font-semibold text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none"
          />
          <button type="button" className={stepBtn} aria-label={`Augmenter de ${step} pièces`} onClick={() => setQuantity(qty + step)}>
            +
          </button>
          <span className="font-body text-sm text-ink-soft">pièces</span>
        </div>
        <p className="mt-1.5 font-body text-xs text-ink-soft">
          Minimum {min} pièces, par paliers de {step} : {min}, {min + step}, {min + 2 * step}…
        </p>
        {quick.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  q === qty ? "border-water bg-water text-cream" : "border-ink/25 bg-white text-ink hover:border-water"
                }`}
              >
                {fmtInt(q)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prix total */}
      <div className="rounded-md border border-ink/10 bg-paper p-4" aria-live="polite">
        {unit == null ? (
          <p className="font-body text-sm text-ink">Prix sur devis : nous vous indiquons le tarif par téléphone.</p>
        ) : (
          <dl className="space-y-1.5 font-body text-sm text-ink">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Prix par pièce</dt>
              <dd className="font-semibold">{money(unit)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Sous-total ({piecesLabel(qty)})</dt>
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
              <dd className="font-display text-2xl text-ink">{money(totals.total)}</dd>
            </div>
          </dl>
        )}
        {rules.discountThreshold > 0 && rules.discountPercent > 0 && missing > 0 && unit != null && (
          <button
            type="button"
            onClick={() => setQuantity(rules.discountThreshold)}
            className="mt-3 block w-full rounded bg-kraft/40 px-3 py-2 text-left font-body text-xs font-semibold text-ink hover:bg-kraft/60"
          >
            −{rules.discountPercent} % dès {fmtInt(rules.discountThreshold)} pièces : plus que {fmtInt(missing)} pièces. Cliquez pour passer à {fmtInt(rules.discountThreshold)}.
          </button>
        )}
      </div>

      {/* Personnalisation */}
      <FileField
        id="achat-logo"
        title="Votre logo"
        tag="obligatoire"
        button="Charger votre logo"
        hint="PNG, JPG ou WebP. Plus il est net, plus l'impression sera belle."
        file={logo}
        preview={logoPreview}
        previewClass="h-20 w-auto bg-white p-1"
        onPick={pickLogo}
      />
      <FileField
        id="achat-photo"
        title="Photo de l'article"
        tag="facultatif"
        button="Charger une photo de l'article"
        hint="Envoyez une photo de l'article que vous possédez et souhaitez personnaliser : elle nous aide à préparer votre personnalisation et à la tester à l'avance."
        file={photo}
        preview={photoPreview}
        previewClass="h-28 w-auto object-cover"
        onPick={pickPhoto}
      />
      <div>
        <label htmlFor="achat-note" className={label}>Précisions (facultatif)</label>
        <textarea id="achat-note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Couleurs, emplacement du logo…" className={field} />
      </div>

      {problem && <p className="font-body text-sm text-red-700">{problem}</p>}

      <button
        type="button"
        onClick={add}
        disabled={busy}
        className="w-full rounded-md bg-water px-4 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60"
      >
        {busy ? "Ajout en cours…" : "Ajouter au panier"}
      </button>

      {added && (
        <div role="status" className="rounded-md border border-water/40 bg-paper p-4">
          <p className="font-body text-sm font-semibold text-ink">Article ajouté au panier ✓</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/panier" className="rounded-md bg-water px-4 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">
              Voir mon panier
            </Link>
            <Link href={`/categorie/${product.categorySlug}`} className="rounded-md border border-ink/25 bg-white px-4 py-2.5 font-body text-sm font-semibold text-ink hover:bg-paper">
              Continuer mes achats
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
