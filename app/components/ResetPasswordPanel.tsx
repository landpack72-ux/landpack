"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { passwordProblem } from "@/lib/password-rules";
import { notifyAccountChanged } from "@/lib/use-account";
import { PasswordInput, PasswordRules, post } from "./AccountPanel";

const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";
const primary =
  "w-full rounded-md bg-water px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60";

// Formulaire de choix du nouveau mot de passe (jetons déjà vérifiés par le serveur).
export function NewPasswordForm({ access, refresh }: { access: string; refresh: string }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const weak = passwordProblem(pass);
    if (weak) return setError(weak);
    if (pass !== pass2) return setError("Les deux mots de passe ne sont pas identiques.");
    setBusy(true);
    setError("");
    const r = await post("/api/account/reset", { access_token: access, refresh_token: refresh, password: pass });
    setBusy(false);
    if (r.ok) {
      setDone(true);
      notifyAccountChanged();
    } else setError(r.error ?? "Une erreur est survenue.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-paper p-6 text-center">
        <h2 className="font-display text-xl text-ink">Mot de passe changé</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">Vous êtes maintenant connecté avec votre nouveau mot de passe.</p>
        <Link href="/compte" className="mt-5 inline-block rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">
          Voir mon compte
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-md border border-ink/10 bg-white p-6">
      <h2 className="font-display text-lg text-ink">Choisissez un nouveau mot de passe</h2>
      <div>
        <label htmlFor="n-pass" className={label}>Nouveau mot de passe</label>
        <PasswordInput id="n-pass" name="password" value={pass} onChange={setPass} autoComplete="new-password" />
        <PasswordRules value={pass} />
      </div>
      <div>
        <label htmlFor="n-pass2" className={label}>Confirmer le mot de passe</label>
        <PasswordInput id="n-pass2" name="password2" value={pass2} onChange={setPass2} autoComplete="new-password" />
      </div>
      {error && <p role="alert" className="font-body text-sm text-red-700">{error}</p>}
      <button className={primary} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
    </form>
  );
}

// Page ouverte par l'ancien type de lien (jetons dans l'adresse #access_token=…) : conservée pour les liens déjà envoyés.
export default function ResetPasswordPanel() {
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null | "none">(null);

  useEffect(() => {
    // Les jetons arrivent dans l'adresse (#access_token=…). On les lit, puis on les efface de l'adresse.
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access = p.get("access_token");
    const refresh = p.get("refresh_token");
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokens(access && refresh && !p.get("error") ? { access, refresh } : "none");
  }, []);

  if (tokens === null) return <p className="font-body text-sm text-ink-soft">Chargement…</p>;
  if (tokens === "none") {
    return (
      <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-white p-6">
        <h2 className="font-display text-lg text-ink">Lien invalide ou expiré</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">Ce lien n&apos;est plus valable (il ne fonctionne qu&apos;une fois, pendant une heure). Demandez-en un nouveau.</p>
        <Link href="/compte?tab=oubli" className="mt-4 inline-block rounded-md bg-water px-5 py-2.5 font-body text-sm font-semibold text-cream hover:bg-water-dark">
          Recevoir un nouveau lien
        </Link>
      </div>
    );
  }
  return <NewPasswordForm access={tokens.access} refresh={tokens.refresh} />;
}
