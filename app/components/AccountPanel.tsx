"use client";

import { useEffect, useState, type FormEvent } from "react";
import { money, fmtInt } from "@/lib/pricing";
import { notifyAccountChanged, useAccount, type Profile } from "@/lib/use-account";

const field =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 font-body text-sm text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none";
const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";
const primary =
  "w-full rounded-md bg-water px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60";

async function post(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    return res.ok && j.ok ? { ok: true } : { ok: false, error: j.error ?? "Une erreur est survenue." };
  } catch {
    return { ok: false, error: "Connexion impossible. Vérifiez votre réseau." };
  }
}

export default function AccountPanel() {
  const { loading, profile } = useAccount();
  if (loading) return <p className="font-body text-sm text-ink-soft">Chargement…</p>;
  return profile ? <Dashboard profile={profile} /> : <AuthForms />;
}

/* ------------------------------ connexion / création de compte ------------------------------ */
function AuthForms() {
  const [tab, setTab] = useState<"connexion" | "inscription">("connexion");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Ouvre l'onglet demandé par le lien (?tab=inscription).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("tab") === "inscription") setTab("inscription");
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>, url: string) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await post(url, d);
    if (r.ok) notifyAccountChanged();
    else setError(r.error ?? "Une erreur est survenue.");
    setBusy(false);
  }

  const tabClass = (t: string) =>
    `min-w-0 flex-1 border-b-2 px-2 py-3 text-center font-body text-sm font-semibold transition-colors [overflow-wrap:anywhere] sm:px-4 ${
      tab === t ? "border-water text-water" : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-white">
      <div className="flex border-b border-ink/10">
        <button type="button" className={tabClass("connexion")} onClick={() => { setTab("connexion"); setError(""); }}>
          Se connecter
        </button>
        <button type="button" className={tabClass("inscription")} onClick={() => { setTab("inscription"); setError(""); }}>
          Créer un compte
        </button>
      </div>

      {tab === "connexion" ? (
        <form onSubmit={(e) => submit(e, "/api/account/login")} className="space-y-4 p-6">
          <div>
            <label htmlFor="c-phone" className={label}>Numéro de téléphone</label>
            <input id="c-phone" name="phone" type="tel" inputMode="tel" autoComplete="username" required className={field} />
          </div>
          <div>
            <label htmlFor="c-pass" className={label}>Mot de passe</label>
            <input id="c-pass" name="password" type="password" autoComplete="current-password" required className={field} />
          </div>
          {error && <p className="font-body text-sm text-red-700">{error}</p>}
          <button className={primary} disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
          <p className="font-body text-xs text-ink-soft">
            Mot de passe oublié ? Contactez-nous par téléphone ou WhatsApp : nous le réinitialisons pour vous.
          </p>
        </form>
      ) : (
        <form onSubmit={(e) => submit(e, "/api/account/register")} className="relative space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="r-first" className={label}>Prénom</label>
              <input id="r-first" name="first_name" required maxLength={80} autoComplete="given-name" className={field} />
            </div>
            <div>
              <label htmlFor="r-last" className={label}>Nom</label>
              <input id="r-last" name="last_name" required maxLength={80} autoComplete="family-name" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="r-phone" className={label}>Numéro de téléphone</label>
            <input id="r-phone" name="phone" type="tel" inputMode="tel" autoComplete="username" required minLength={6} maxLength={40} className={field} />
            <p className="mt-1 font-body text-xs text-ink-soft">C&apos;est votre identifiant : aucune adresse e-mail n&apos;est demandée.</p>
          </div>
          <div>
            <label htmlFor="r-pass" className={label}>Mot de passe</label>
            <input id="r-pass" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} className={field} />
            <p className="mt-1 font-body text-xs text-ink-soft">8 caractères minimum.</p>
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="r-website">Ne pas remplir</label>
            <input id="r-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {error && <p className="font-body text-sm text-red-700">{error}</p>}
          <button className={primary} disabled={busy}>{busy ? "Création…" : "Créer mon compte"}</button>
        </form>
      )}
    </div>
  );
}

/* ------------------------------ espace client ------------------------------ */
type Order = { id: string; product: string | null; quantity: number | null; total_amount?: number | null; is_handled: boolean; created_at: string };

function Dashboard({ profile }: { profile: Profile }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/account/orders", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((j) => alive && setOrders(j.orders ?? []))
      .catch(() => alive && setOrders([]));
    return () => {
      alive = false;
    };
  }, []);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await post("/api/account/profile", Object.fromEntries(new FormData(e.currentTarget).entries()));
    setMsg({ ok: r.ok, text: r.ok ? "Informations enregistrées." : (r.error ?? "Erreur.") });
    if (r.ok) notifyAccountChanged();
    setBusy(false);
  }

  async function logout() {
    await post("/api/account/logout", {});
    notifyAccountChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-md border border-ink/10 bg-white p-6">
        <h2 className="font-display text-lg text-ink">Mes informations</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-first" className={label}>Prénom</label>
              <input id="p-first" name="first_name" required maxLength={80} defaultValue={profile.first_name} className={field} />
            </div>
            <div>
              <label htmlFor="p-last" className={label}>Nom</label>
              <input id="p-last" name="last_name" required maxLength={80} defaultValue={profile.last_name} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="p-phone" className={label}>Téléphone (identifiant)</label>
            <input id="p-phone" value={profile.phone} readOnly className={`${field} bg-paper`} />
          </div>
          <div>
            <label htmlFor="p-address" className={label}>Adresse de livraison</label>
            <textarea id="p-address" name="address" rows={2} maxLength={300} defaultValue={profile.address} className={field} />
          </div>
          {msg && <p className={`font-body text-sm ${msg.ok ? "text-water" : "text-red-700"}`}>{msg.text}</p>}
          <button className={primary} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
        </form>
        <button type="button" onClick={logout} className="mt-4 w-full rounded-md border border-ink/25 px-4 py-2.5 font-body text-sm font-semibold text-ink hover:bg-paper">
          Se déconnecter
        </button>
      </section>

      <section className="rounded-md border border-ink/10 bg-white p-6">
        <h2 className="font-display text-lg text-ink">Mes commandes</h2>
        {!orders ? (
          <p className="mt-4 font-body text-sm text-ink-soft">Chargement…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 font-body text-sm text-ink-soft">
            Vous n&apos;avez pas encore passé de commande. Choisissez un article dans les catégories, puis commandez-le : il apparaîtra ici.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-3">
                <div className="min-w-0">
                  <p className="font-body text-sm font-semibold text-ink">{o.product ?? "Commande"}</p>
                  <p className="font-body text-xs text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                    {o.quantity ? ` · ${fmtInt(o.quantity)} pièces` : ""}{o.total_amount != null ? ` · ${money(Number(o.total_amount))}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded px-2 py-0.5 font-body text-xs font-semibold ${o.is_handled ? "bg-paper text-ink-soft" : "bg-kraft text-ink"}`}>
                  {o.is_handled ? "Traitée" : "En cours"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
