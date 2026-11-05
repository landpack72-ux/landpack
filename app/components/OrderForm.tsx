"use client";

import Link from "next/link";
import ConsentCheck from "./ConsentCheck";
import { useId, useState, type FormEvent } from "react";
import { submitLead, uploadCustomerLogo, uploadCustomerPhoto } from "@/lib/leads";
import { useAccount } from "@/lib/use-account";
import FileField from "./FileField";

export type Model = {
  id: string;
  label: string;
  group?: string;
  min_qty: number | null;
  price_label: string | null;
};

type Status = "idle" | "sending" | "success" | "error" | "wait";

const field =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 font-body text-sm text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none";
const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";

/**
 * Formulaire de commande : Landpack ne fait que la personnalisation, le logo du client est donc
 * toujours demandé. Aucune adresse e-mail n'est demandée. Un client connecté voit ses informations
 * préremplies et sa commande est ajoutée à son compte.
 */
export default function OrderForm({
  models,
  initialId,
  locked = false,
  source,
}: {
  models: Model[];
  initialId?: string;
  locked?: boolean;
  source: string;
}) {
  const uid = useId();
  const { profile } = useAccount();
  const [modelId, setModelId] = useState(initialId ?? models[0]?.id ?? "");
  const model = models.find((m) => m.id === modelId) ?? models[0];
  const [qty, setQty] = useState(String(model?.min_qty ?? 1));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState("");

  if (!model) return null;

  const min = model.min_qty ?? 1;
  const groups = Array.from(new Set(models.map((m) => m.group).filter(Boolean))) as string[];
  const k = profile ? "compte" : "visiteur"; // recrée les champs préremplis quand le compte est détecté

  function changeModel(id: string) {
    setModelId(id);
    setQty(String(models.find((m) => m.id === id)?.min_qty ?? 1));
  }
  function pickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setProblem("");
  }

  function pickPhoto(f: File | null) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(f);
    setPhotoPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setProblem("Ajoutez votre logo : c'est lui que nous imprimons sur votre article.");
      return;
    }
    setStatus("sending");
    setProblem("");
    const data = new FormData(e.currentTarget);
    const get = (n: string) => String(data.get(n) ?? "");

    let logoPath: string;
    let photoPath: string | undefined;
    try {
      logoPath = await uploadCustomerLogo(file);
      if (photo) photoPath = await uploadCustomerPhoto(photo);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "L'envoi du fichier a échoué.");
      setStatus("error");
      return;
    }

    const order = {
      firstName: get("first_name"),
      lastName: get("last_name"),
      product: model.label,
      quantity: Number(qty),
      isCustom: true,
      logoPath,
      photoPath,
      phone: get("phone"),
      address: get("address"),
      message: get("message"),
      source,
      trap: get("website"),
      consent: get("consent") === "on",
    };

    let ok = false;
    let result: "ok" | "error" | "wait" = "error";
    if (profile) {
      // Client connecté : la commande passe par le serveur, qui la lie au compte.
      const res = await fetch("/api/account/order", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: order.firstName, last_name: order.lastName, product: order.product, quantity: order.quantity,
          is_custom: true, logo_path: order.logoPath, photo_path: order.photoPath, phone: order.phone, address: order.address,
          message: order.message, source: order.source, website: order.trap, consent: order.consent,
        }),
      }).catch(() => null);
      ok = !!res?.ok;
      result = ok ? "ok" : "error";
    } else {
      result = await submitLead(order);
      ok = result === "ok";
    }

    if (!ok) {
      setProblem(
        result === "wait"
          ? "Votre demande vient d'être envoyée. Patientez quelques secondes avant d'en envoyer une autre."
          : "Un problème est survenu : vérifiez vos informations et réessayez.",
      );
    }
    setStatus(ok ? "success" : result === "wait" ? "wait" : "error");
  }

  if (status === "success") {
    return (
      <div className="rounded-md bg-paper p-6 text-center">
        <p className="font-display text-xl text-ink">Commande envoyée</p>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Merci, nous vous appelons très vite pour la confirmer et valider votre logo.
        </p>
        {profile && (
          <Link href="/compte" className="mt-4 inline-block font-body text-sm font-semibold text-water underline">
            Voir mes commandes
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4">
      <div>
        <label htmlFor={`${uid}-model`} className={label}>Article</label>
        {locked ? (
          <input id={`${uid}-model`} value={model.label} readOnly className={`${field} bg-paper font-semibold`} />
        ) : (
          <select id={`${uid}-model`} value={modelId} onChange={(e) => changeModel(e.target.value)} className={field}>
            {groups.length
              ? groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {models.filter((m) => m.group === g).map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </optgroup>
                ))
              : models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
          </select>
        )}
        <p className="mt-1.5 font-body text-xs text-ink-soft">Prix : {model.price_label ?? "sur devis"}</p>
      </div>

      <FileField
        id={`${uid}-logo`}
        title="Votre logo"
        tag="obligatoire"
        button="Charger votre logo"
        hint="PNG, JPG ou WebP. Plus il est net, plus l'impression sera belle."
        file={file}
        preview={preview}
        previewClass="h-20 w-auto bg-white p-1"
        onPick={pickFile}
      />

      <FileField
        id={`${uid}-photo`}
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
        <label htmlFor={`${uid}-notes`} className={label}>Précisions (facultatif)</label>
        <textarea id={`${uid}-notes`} name="message" rows={2} maxLength={1000} placeholder="Couleurs, emplacement du logo…" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-first`} className={label}>Prénom</label>
          <input key={`f-${k}`} id={`${uid}-first`} name="first_name" required maxLength={80} autoComplete="given-name" defaultValue={profile?.first_name ?? ""} className={field} />
        </div>
        <div>
          <label htmlFor={`${uid}-last`} className={label}>Nom</label>
          <input key={`l-${k}`} id={`${uid}-last`} name="last_name" required maxLength={80} autoComplete="family-name" defaultValue={profile?.last_name ?? ""} className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-qty`} className={label}>Quantité souhaitée</label>
          <input id={`${uid}-qty`} type="number" required min={min} step={1} value={qty} onChange={(e) => setQty(e.target.value)} className={field} />
          {min > 1 && <p className="mt-1 font-body text-xs text-ink-soft">Minimum : {min} unité(s)</p>}
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={label}>Téléphone</label>
          <input key={`p-${k}`} id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={6} maxLength={40} defaultValue={profile?.phone ?? ""} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-address`} className={label}>Adresse de livraison</label>
        <textarea key={`a-${k}`} id={`${uid}-address`} name="address" rows={2} required maxLength={300} autoComplete="street-address" defaultValue={profile?.address ?? ""} className={field} />
      </div>

      {/* Champ piège pour les robots : invisible pour les visiteurs */}
      <ConsentCheck id={`${uid}-consent`} />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-website`}>Ne pas remplir</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="font-body text-xs text-ink-soft">
        {profile ? (
          "Connecté : cette commande sera ajoutée à votre compte."
        ) : (
          <>
            Déjà client ?{" "}
            <Link href="/compte?tab=connexion" className="font-semibold text-water underline">Se connecter</Link> pour préremplir ce formulaire.
          </>
        )}{" "}
      </p>
      {problem && <p className="font-body text-sm text-red-700">{problem}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-water px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer ma commande"}
      </button>
    </form>
  );
}
