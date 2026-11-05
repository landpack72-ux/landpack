"use client";

import { useEffect, useState, type FormEvent } from "react";
import { passwordChecks, passwordProblem } from "@/lib/password-rules";
import { fmtInt, money } from "@/lib/pricing";
import { notifyAccountChanged, useAccount, type Profile } from "@/lib/use-account";

const field =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 font-body text-sm text-ink focus:border-water focus:ring-1 focus:ring-water focus:outline-none";
const label = "block font-body text-xs font-semibold uppercase tracking-wide text-ink-soft";
const primary =
  "w-full rounded-md bg-water px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-water-dark disabled:opacity-60";
const linkBtn = "font-body text-sm font-semibold text-water underline hover:text-water-dark";

type Result = { ok: boolean; error?: string; needsConfirmation?: boolean };

export async function post(url: string, body: unknown): Promise<Result> {
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => null);
    if (res.ok && j?.ok) return { ok: true, needsConfirmation: !!j.needsConfirmation };
    // Réponse sans message lisible (panne de l'hébergeur, délai dépassé…) : on affiche le code pour pouvoir diagnostiquer.
    const technical = !j?.error ? ` (code ${res.status}). Réessayez dans un instant ; si cela continue, contactez-nous en donnant ce code.` : "";
    return { ok: false, error: j?.error ?? `Le service est momentanément indisponible${technical}`, needsConfirmation: !!j?.needsConfirmation };
  } catch {
    return { ok: false, error: "Connexion impossible. Vérifiez votre réseau et réessayez." };
  }
}

// Champ mot de passe avec bouton « Afficher / Masquer »
export function PasswordInput({
  id, name, value, onChange, autoComplete, required = true,
}: { id: string; name: string; value: string; onChange: (v: string) => void; autoComplete: string; required?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        maxLength={72}
        className={`${field} pr-24`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute right-2 top-[calc(0.375rem+1px)] rounded px-2.5 py-1.5 font-body text-xs font-semibold text-ink-soft hover:bg-paper hover:text-ink"
      >
        {show ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}

// Aide en direct : les règles du mot de passe se cochent au fur et à mesure
export function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs" aria-live="polite">
      {passwordChecks(value).map((c) => (
        <li key={c.label} className={c.ok ? "font-semibold text-water" : "text-ink-soft"}>
          {c.ok ? "✓" : "○"} {c.label}
        </li>
      ))}
    </ul>
  );
}

export default function AccountPanel() {
  const { loading, profile } = useAccount();
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Retour depuis un lien reçu par e-mail : la session arrive dans l'adresse (#access_token=…)
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const p = new URLSearchParams(hash);
    const clear = () => window.history.replaceState(null, "", window.location.pathname);

    if (p.get("error")) {
      const expired = (p.get("error_code") ?? "").includes("expired") || (p.get("error_description") ?? "").toLowerCase().includes("expired");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBanner({ ok: false, text: expired ? "Ce lien a expiré. Demandez un nouvel e-mail (« Mot de passe oublié » ou « Renvoyer l'e-mail »)." : "Ce lien n'est pas valable. Demandez un nouvel e-mail." });
      clear();
      return;
    }
    const access = p.get("access_token");
    const refresh = p.get("refresh_token");
    if (!access || !refresh) return;

    if (p.get("type") === "recovery") {
      window.location.replace(`/compte/nouveau-mot-de-passe${window.location.hash}`);
      return;
    }
    post("/api/account/confirm", { access_token: access, refresh_token: refresh }).then((r) => {
      clear();
      if (r.ok) {
        setBanner({ ok: true, text: "Votre adresse e-mail est confirmée. Bienvenue chez Landpack !" });
        notifyAccountChanged();
      } else setBanner({ ok: false, text: r.error ?? "Ce lien n'est pas valable. Demandez un nouvel e-mail." });
    });
  }, []);

  if (loading) return <p className="font-body text-sm text-ink-soft">Chargement…</p>;
  return (
    <div className="space-y-5">
      {banner && (
        <p role="status" className={`rounded-md border px-4 py-3 font-body text-sm ${banner.ok ? "border-water/40 bg-paper text-ink" : "border-red-200 bg-red-50 text-red-700"}`}>
          {banner.text}
        </p>
      )}
      {profile ? <Dashboard profile={profile} /> : <AuthForms />}
    </div>
  );
}

/* ------------------------------ connexion / création de compte ------------------------------ */
type View = "login" | "register" | "forgot" | "confirm" | "reset-sent";

function AuthForms() {
  const [view, setView] = useState<View>("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    // Ouvre l'onglet demandé par le lien (?tab=inscription ou ?tab=oubli).
    const t = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t === "inscription") setView("register");
    else if (t === "oubli") setView("forgot");
  }, []);

  function go(v: View) {
    setView(v);
    setError("");
    setInfo("");
  }

  async function submit(e: FormEvent<HTMLFormElement>, kind: "login" | "register" | "forgot") {
    e.preventDefault();
    setError("");
    setInfo("");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const mail = (d.email ?? "").trim();
    setEmail(mail);

    if (kind === "register") {
      const weak = passwordProblem(pass);
      if (weak) return setError(weak);
      if (pass !== pass2) return setError("Les deux mots de passe ne sont pas identiques.");
    }
    setBusy(true);
    const url = kind === "login" ? "/api/account/login" : kind === "register" ? "/api/account/register" : "/api/account/forgot";
    const r = await post(url, { ...d, email: mail, password: kind === "login" ? pass : pass });
    setBusy(false);
    if (kind === "forgot") return r.ok ? go("reset-sent") : setError(r.error ?? "Une erreur est survenue.");
    if (r.ok && r.needsConfirmation) return go("confirm");
    if (!r.ok && r.needsConfirmation) {
      setError(r.error ?? "");
      return go("confirm");
    }
    if (r.ok) notifyAccountChanged();
    else setError(r.error ?? "Une erreur est survenue.");
  }

  async function resend() {
    setBusy(true);
    setInfo("");
    const r = await post("/api/account/resend", { email });
    setBusy(false);
    setInfo(r.ok ? "E-mail renvoyé. Pensez à regarder dans vos courriers indésirables." : (r.error ?? "Envoi impossible."));
  }

  const tab = (active: boolean) =>
    `min-w-0 flex-1 border-b-2 px-2 py-3 text-center font-body text-sm font-semibold transition-colors sm:px-4 ${
      active ? "border-water text-water" : "border-transparent text-ink-soft hover:text-ink"
    }`;
  const showTabs = view === "login" || view === "register";

  return (
    <div className="mx-auto max-w-md rounded-md border border-ink/10 bg-white">
      {showTabs && (
        <div className="flex border-b border-ink/10">
          <button type="button" className={tab(view === "login")} onClick={() => go("login")}>Se connecter</button>
          <button type="button" className={tab(view === "register")} onClick={() => go("register")}>Créer un compte</button>
        </div>
      )}

      {view === "login" && (
        <form onSubmit={(e) => submit(e, "login")} className="space-y-4 p-6">
          <div>
            <label htmlFor="c-mail" className={label}>Adresse e-mail</label>
            <input id="c-mail" name="email" type="email" autoComplete="username" required defaultValue={email} className={field} />
          </div>
          <div>
            <label htmlFor="c-pass" className={label}>Mot de passe</label>
            <PasswordInput id="c-pass" name="password" value={pass} onChange={setPass} autoComplete="current-password" />
          </div>
          {error && <p role="alert" className="font-body text-sm text-red-700">{error}</p>}
          <button className={primary} disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
          <button type="button" className={linkBtn} onClick={() => go("forgot")}>Mot de passe oublié ?</button>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={(e) => submit(e, "register")} className="relative space-y-4 p-6">
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
            <label htmlFor="r-mail" className={label}>Adresse e-mail</label>
            <input id="r-mail" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={email} className={field} />
            <p className="mt-1 font-body text-xs text-ink-soft">Elle sert à confirmer votre compte et à retrouver votre mot de passe. Elle n&apos;est jamais affichée.</p>
          </div>
          <div>
            <label htmlFor="r-phone" className={label}>Téléphone</label>
            <input id="r-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={6} maxLength={40} className={field} />
            <p className="mt-1 font-body text-xs text-ink-soft">Pour vous appeler au sujet de vos commandes.</p>
          </div>
          <div>
            <label htmlFor="r-pass" className={label}>Mot de passe</label>
            <PasswordInput id="r-pass" name="password" value={pass} onChange={setPass} autoComplete="new-password" />
            <PasswordRules value={pass} />
          </div>
          <div>
            <label htmlFor="r-pass2" className={label}>Confirmer le mot de passe</label>
            <PasswordInput id="r-pass2" name="password2" value={pass2} onChange={setPass2} autoComplete="new-password" />
            {pass2 && pass !== pass2 && <p className="mt-1 font-body text-xs text-red-700">Les deux mots de passe ne sont pas identiques.</p>}
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="r-website">Ne pas remplir</label>
            <input id="r-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {error && <p role="alert" className="font-body text-sm text-red-700">{error}</p>}
          <button className={primary} disabled={busy}>{busy ? "Création…" : "Créer mon compte"}</button>
          <p className="font-body text-xs text-ink-soft">Vos informations servent uniquement à gérer votre compte et vos commandes.</p>
        </form>
      )}

      {view === "forgot" && (
        <form onSubmit={(e) => submit(e, "forgot")} className="space-y-4 p-6">
          <h2 className="font-display text-lg text-ink">Mot de passe oublié</h2>
          <p className="font-body text-sm text-ink-soft">Indiquez l&apos;adresse e-mail de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
          <div>
            <label htmlFor="f-mail" className={label}>Adresse e-mail</label>
            <input id="f-mail" name="email" type="email" autoComplete="email" required defaultValue={email} className={field} />
          </div>
          {error && <p role="alert" className="font-body text-sm text-red-700">{error}</p>}
          <button className={primary} disabled={busy}>{busy ? "Envoi…" : "Envoyer le lien"}</button>
          <button type="button" className={linkBtn} onClick={() => go("login")}>← Retour à la connexion</button>
        </form>
      )}

      {view === "reset-sent" && (
        <div className="space-y-4 p-6">
          <h2 className="font-display text-lg text-ink">Vérifiez votre boîte e-mail</h2>
          <p className="font-body text-sm text-ink-soft">
            Si un compte existe pour <strong className="text-ink">{email}</strong>, un e-mail avec un lien de réinitialisation vient de partir. Le lien est valable une heure.
            Pensez à regarder dans vos courriers indésirables.
          </p>
          <button type="button" className={linkBtn} onClick={() => go("login")}>← Retour à la connexion</button>
        </div>
      )}

      {view === "confirm" && (
        <div className="space-y-4 p-6">
          <h2 className="font-display text-lg text-ink">Confirmez votre adresse e-mail</h2>
          <p className="font-body text-sm text-ink-soft">
            Un e-mail de confirmation a été envoyé à <strong className="text-ink">{email}</strong>. Cliquez sur le lien qu&apos;il contient pour activer votre compte,
            puis revenez vous connecter. Pensez à regarder dans vos courriers indésirables.
          </p>
          {error && <p role="alert" className="font-body text-sm text-red-700">{error}</p>}
          {info && <p role="status" className="font-body text-sm font-semibold text-water">{info}</p>}
          <button type="button" className={primary} onClick={resend} disabled={busy}>{busy ? "Envoi…" : "Renvoyer l'e-mail"}</button>
          <button type="button" className={linkBtn} onClick={() => go("login")}>← Retour à la connexion</button>
        </div>
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
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    const weak = passwordProblem(next);
    if (weak) return setPwdMsg({ ok: false, text: weak });
    if (next !== next2) return setPwdMsg({ ok: false, text: "Les deux nouveaux mots de passe ne sont pas identiques." });
    setBusy(true);
    const r = await post("/api/account/password", { current: cur, next });
    setBusy(false);
    setPwdMsg({ ok: r.ok, text: r.ok ? "Mot de passe changé." : (r.error ?? "Erreur.") });
    if (r.ok) {
      setCur("");
      setNext("");
      setNext2("");
    }
  }

  async function logout() {
    await post("/api/account/logout", {});
    window.history.replaceState(null, "", "/compte"); // on retire « ?tab=… » : on revient sur l'écran de connexion
    notifyAccountChanged();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      <div className="min-w-0 space-y-6">
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
              <label htmlFor="p-email" className={label}>Adresse e-mail (identifiant)</label>
              <input id="p-email" value={profile.email} readOnly className={`${field} bg-paper [overflow-wrap:anywhere]`} />
            </div>
            <div>
              <label htmlFor="p-phone" className={label}>Téléphone</label>
              <input id="p-phone" name="phone" type="tel" inputMode="tel" required minLength={6} maxLength={40} defaultValue={profile.phone} className={field} />
            </div>
            <div>
              <label htmlFor="p-address" className={label}>Adresse de livraison</label>
              <textarea id="p-address" name="address" rows={2} maxLength={300} defaultValue={profile.address} className={field} />
            </div>
            {msg && <p className={`font-body text-sm ${msg.ok ? "text-water" : "text-red-700"}`}>{msg.text}</p>}
            <button className={primary} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
          </form>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-6">
          <details>
            <summary className="cursor-pointer font-display text-lg text-ink">Changer mon mot de passe</summary>
            <form onSubmit={changePassword} className="mt-4 space-y-4">
              <div>
                <label htmlFor="w-cur" className={label}>Mot de passe actuel</label>
                <PasswordInput id="w-cur" name="current" value={cur} onChange={setCur} autoComplete="current-password" />
              </div>
              <div>
                <label htmlFor="w-new" className={label}>Nouveau mot de passe</label>
                <PasswordInput id="w-new" name="next" value={next} onChange={setNext} autoComplete="new-password" />
                <PasswordRules value={next} />
              </div>
              <div>
                <label htmlFor="w-new2" className={label}>Confirmer le nouveau mot de passe</label>
                <PasswordInput id="w-new2" name="next2" value={next2} onChange={setNext2} autoComplete="new-password" />
              </div>
              {pwdMsg && <p role="status" className={`font-body text-sm ${pwdMsg.ok ? "text-water" : "text-red-700"}`}>{pwdMsg.text}</p>}
              <button className={primary} disabled={busy}>{busy ? "…" : "Changer le mot de passe"}</button>
            </form>
          </details>
        </section>

        <button type="button" onClick={logout} className="w-full rounded-md border border-ink/25 px-4 py-2.5 font-body text-sm font-semibold text-ink hover:bg-paper">
          Se déconnecter
        </button>
      </div>

      <section className="min-w-0 self-start rounded-md border border-ink/10 bg-white p-6">
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
                  <p className="font-body text-sm font-semibold text-ink [overflow-wrap:anywhere]">{o.product ?? "Commande"}</p>
                  <p className="font-body text-xs text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                    {o.quantity ? ` · ${fmtInt(o.quantity)} pièces` : ""}
                    {o.total_amount != null ? ` · ${money(Number(o.total_amount))}` : ""}
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
