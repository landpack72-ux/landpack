"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAccount, notifyAccountChanged, type Profile } from "@/lib/use-account";
import { post } from "./AccountPanel";
import { NewPasswordForm } from "./ResetPasswordPanel";

type Step =
  | { kind: "loading" }
  | { kind: "ready"; tokenHash: string; type: "signup" | "email" | "recovery" }
  | { kind: "invalid" }
  | { kind: "done"; profile: Profile }
  | { kind: "confirmed" } // e-mail confirmé mais la connexion automatique n'a pas pu être vérifiée
  | { kind: "recovery"; access: string; refresh: string }
  | { kind: "failed"; message: string };

const primary =
  "w-full rounded-md bg-water px-4 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60";

// Page d'arrivée des liens d'e-mail. Elle n'utilise RIEN à l'ouverture : le lien n'est consommé que lorsque le client
// clique sur le bouton. Ainsi les antivirus et messageries qui « visitent » les liens ne les font plus expirer.
export default function VerifyPanel() {
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tokenHash = q.get("token_hash") ?? "";
    const type = q.get("type");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(tokenHash && (type === "signup" || type === "email" || type === "recovery") ? { kind: "ready", tokenHash, type } : { kind: "invalid" });
  }, []);

  async function confirm() {
    if (step.kind !== "ready") return;
    setBusy(true);
    try {
      const res = await fetch("/api/account/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_hash: step.tokenHash, type: step.type }),
      });
      const j = await res.json().catch(() => ({}));
      window.history.replaceState(null, "", window.location.pathname);
      if (res.ok && j.ok && j.recovery) setStep({ kind: "recovery", access: j.access_token, refresh: j.refresh_token });
      else if (res.ok && j.ok) {
        // On ne dit « connecté » que si le serveur le confirme vraiment : on relit la session juste après.
        notifyAccountChanged();
        const profile = await loadAccount(true);
        setStep(profile ? { kind: "done", profile } : { kind: "confirmed" });
      } else setStep({ kind: "failed", message: j.error ?? "Ce lien n'est pas valable. Demandez un nouvel e-mail." });
    } catch {
      setStep({ kind: "failed", message: "Connexion impossible. Vérifiez votre réseau et réessayez." });
    }
    setBusy(false);
  }

  if (step.kind === "loading") return <p className="font-body text-sm text-ink-soft">Chargement…</p>;
  if (step.kind === "recovery") return <NewPasswordForm access={step.access} refresh={step.refresh} />;

  if (step.kind === "invalid" || step.kind === "failed") {
    return (
      <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-white p-6">
        <h2 className="font-display text-lg text-ink">Lien invalide ou expiré</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">
          {step.kind === "failed" ? step.message : "Ce lien n'est pas valable ou a déjà été utilisé. Demandez un nouvel e-mail."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/compte?tab=oubli" className="rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">Mot de passe oublié</Link>
          <Link href="/compte" className="rounded-md border border-ink/25 bg-white px-5 py-2.5 font-body text-sm font-semibold text-ink hover:bg-paper">Mon compte</Link>
        </div>
      </div>
    );
  }

  if (step.kind === "confirmed") {
    return (
      <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-paper p-6 text-center">
        <h2 className="font-display text-xl text-ink">Adresse e-mail confirmée</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Votre compte est actif, mais la connexion automatique n&apos;a pas abouti. Connectez-vous avec votre e-mail et votre mot de passe.
        </p>
        <Link href="/compte" className="mt-5 inline-block rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">Me connecter</Link>
      </div>
    );
  }

  if (step.kind === "done") {
    return (
      <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-paper p-6 text-center">
        <h2 className="font-display text-xl text-ink">Adresse e-mail confirmée</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">Bienvenue chez Landpack ! Votre compte est actif.</p>
        <p className="mt-3 font-body text-sm text-ink">
          Connecté en tant que <strong>{`${step.profile.first_name} ${step.profile.last_name}`.trim() || "client"}</strong>
          <br />
          <span className="[overflow-wrap:anywhere]">{step.profile.email}</span>
        </p>
        <Link href="/compte" className="mt-5 inline-block rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">Voir mon compte</Link>
      </div>
    );
  }

  const recovery = step.type === "recovery";
  return (
    <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-white p-6 text-center">
      <h2 className="font-display text-xl text-ink">{recovery ? "Nouveau mot de passe" : "Confirmez votre adresse e-mail"}</h2>
      <p className="mt-2 font-body text-sm text-ink-soft">
        {recovery ? "Cliquez sur le bouton pour choisir un nouveau mot de passe." : "Une dernière étape : cliquez sur le bouton pour activer votre compte."}
      </p>
      <button type="button" onClick={confirm} disabled={busy} className={`${primary} mt-5`}>
        {busy ? "Vérification…" : recovery ? "Choisir un nouveau mot de passe" : "Confirmer mon adresse e-mail"}
      </button>
    </div>
  );
}
