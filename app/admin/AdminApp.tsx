"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PAGES, SECTION_DEFS, type Field, type SectionDef } from "@/lib/content";
import { money, fmtInt } from "@/lib/pricing";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, defaultProducts, type Category, type Product } from "@/lib/defaults";
import { adminDb } from "./api";
import { uploadImage } from "./image";
import { PRESETS, type ImagePreset } from "@/lib/images";

type Row<T> = T & { id: string };
type SectionRow = {
  id: string;
  section: string;
  sort_order: number;
  is_active: boolean;
  data: Record<string, string>;
};
type Ctx = { notify: (msg: string, ok?: boolean) => void };

const input =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-water focus:ring-1 focus:ring-water";
const btn =
  "rounded-lg bg-water px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm text-ink transition-colors hover:bg-cream disabled:opacity-50";

/* ------------------------------------------------------------------ */
/* Écran principal : connexion, onglets                                */
/* La session est un cookie HttpOnly géré par le serveur : ce code ne  */
/* manipule jamais de jeton de connexion.                              */
/* ------------------------------------------------------------------ */
export default function AdminApp() {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"leads" | "products" | "pages" | "settings">("leads");
  const [newCount, setNewCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  }, []);

  async function refreshSite() {
    const res = await fetch("/api/admin/refresh", { method: "POST", credentials: "same-origin" }).catch(() => null);
    notify(res?.ok ? "Site actualisé : les dernières modifications sont visibles. Faites Ctrl + Maj + R sur le site." : "L'actualisation a échoué. Réessayez.", !!res?.ok);
  }

  // Au chargement : le serveur indique s'il existe une session administrateur valide.
  useEffect(() => {
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.ok) {
          setEmail(j.email);
          setState("in");
        } else setState("out");
      })
      .catch(() => setState("out"));
  }, []);

  // Session expirée pendant l'utilisation : retour à l'écran de connexion.
  useEffect(() => {
    const expired = () => setState("out");
    window.addEventListener("lp-session-expired", expired);
    return () => window.removeEventListener("lp-session-expired", expired);
  }, []);

  // Nombre de nouvelles demandes, visible dans l'onglet même quand on est ailleurs.
  useEffect(() => {
    if (state !== "in") return;
    adminDb
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("is_handled", false)
      .then(({ count }) => setNewCount(count ?? 0));
  }, [state]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    setState("out");
  }

  const ctx = useMemo<Ctx>(() => ({ notify }), [notify]);

  if (state === "loading") return <Centered>Chargement…</Centered>;
  if (state === "out") {
    return (
      <Login
        onDone={(mail) => {
          setEmail(mail);
          setState("in");
        }}
      />
    );
  }

  const tabs = [
    ["leads", newCount > 0 ? `Demandes (${newCount})` : "Demandes"],
    ["products", "Catalogue"],
    ["pages", "Accueil & style"],
    ["settings", "Coordonnées & logo"],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl [overflow-wrap:anywhere] sm:text-3xl">Administration Landpack</h1>
          <p className="text-sm text-ink-soft [overflow-wrap:anywhere]">Connecté : {email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} onClick={refreshSite} title="Vide la mémoire du site : à utiliser si une modification met du temps à apparaître">
            Actualiser le site
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className={btnGhost}>
            Voir le site
          </a>
          <button className={btnGhost} onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-ink/10">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === key ? "border-water font-semibold text-water" : "border-transparent text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mt-6">
        {tab === "leads" && <LeadsTab ctx={ctx} onCount={setNewCount} />}
        {tab === "products" && <CatalogueTab ctx={ctx} />}
        {tab === "pages" && <PagesTab ctx={ctx} />}
        {tab === "settings" && <SettingsTab ctx={ctx} />}
      </main>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm text-white shadow-lg ${
            toast.ok ? "bg-water" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Connexion                                                           */
/* ------------------------------------------------------------------ */
function Login({ onDone }: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setPassword("");
        onDone(j.email ?? email.trim());
      } else {
        setError(j.error ?? "Connexion impossible.");
      }
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
    }
    setBusy(false);
  }

  return (
    <Centered>
      <form onSubmit={submit} className="w-full space-y-3 rounded-2xl border border-ink/10 bg-paper p-6 text-left">
        <h1 className="font-display text-2xl">Connexion admin</h1>
        <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        <input className={input} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className={`${btn} w-full`} disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </Centered>
  );
}

/* ------------------------------------------------------------------ */
/* Champs de formulaire (texte, long texte, photo)                     */
/* ------------------------------------------------------------------ */
const PREVIEW_BOX: Record<ImagePreset, string> = {
  product: "aspect-square w-28",
  category: "aspect-[4/3] w-32",
  slide: "aspect-[8/3] w-52",
  logo: "h-20 w-32",
  generic: "h-20 w-28",
};

// Champ photo : le client choisit n'importe quelle photo ; elle est adaptée au format de l'emplacement,
// convertie en WebP, allégée et enregistrée en 3 tailles (téléphone, tablette, ordinateur).
function ImageField({
  value,
  onChange,
  ctx,
  preset = "generic",
  clearable = false,
  autoSave,
}: {
  value: string;
  onChange: (v: string) => void;
  ctx: Ctx;
  preset?: ImagePreset;
  clearable?: boolean;
  /** Si renseigné, la photo est enregistrée et publiée dès son envoi (renvoie un message d'erreur, ou null si tout va bien). */
  autoSave?: (url: string) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [broken, setBroken] = useState(false);
  const P = PRESETS[preset];
  const fitClass = preset === "product" || preset === "logo" ? "object-contain" : "object-cover";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadImage(file, preset === "product" ? "products" : "content", preset);
      setBroken(false);
      onChange(r.url);
      setInfo(r.info);
      if (autoSave) {
        const err = await autoSave(r.url);
        if (err) ctx.notify("Photo envoyée, mais l'enregistrement a échoué : " + err, false);
        else ctx.notify("Photo optimisée, enregistrée et publiée : le site est à jour.");
      } else {
        ctx.notify("Photo optimisée et envoyée. Enregistrez (ou ajoutez le modèle) pour la publier.");
      }
    } catch (e) {
      ctx.notify(e instanceof Error ? e.message : "Échec de l'envoi de la photo.", false);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className={`${PREVIEW_BOX[preset]} shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-white`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" onError={() => setBroken(true)} onLoad={() => setBroken(false)} className={`h-full w-full ${fitClass}`} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-paper px-1 text-center text-xs text-ink-soft">Pas de photo</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`${btnGhost} inline-block cursor-pointer`}>
            {busy ? "Optimisation et envoi…" : value ? "Changer la photo" : "Choisir une photo"}
            <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {clearable && value && (
            <button type="button" className={btnGhost} onClick={() => { onChange(""); setInfo(""); }}>Retirer</button>
          )}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-ink-soft">
        <strong className="text-ink">{P.label}.</strong> {P.hint} Toute photo (JPG, PNG, WebP, même très grande) est acceptée : elle est
        automatiquement adaptée, convertie en WebP et allégée.
        {info && <span className="mt-0.5 block font-semibold text-water">Dernier envoi : {info}</span>}
        {broken && (
          <span className="mt-1 block rounded bg-red-50 px-2 py-1 font-semibold text-red-700">
            Cette image ne s&apos;affiche pas. Vérifiez que le stockage « site-images » est bien public dans Supabase (Storage), puis renvoyez la photo.
          </span>
        )}
      </p>
    </div>
  );
}

function FieldInput({ field, value, onChange, ctx, preset = "generic" }: { field: Field; value: string; onChange: (v: string) => void; ctx: Ctx; preset?: ImagePreset }) {
  if (field.kind === "toggle") {
    return (
      <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm">
        <input type="checkbox" className="h-4 w-4" checked={value === "1"} onChange={(e) => onChange(e.target.checked ? "1" : "0")} />
        {field.label}
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{field.label}</span>
      {field.kind === "image" ? (
        <ImageField value={value} onChange={onChange} ctx={ctx} preset={preset} />
      ) : field.kind === "color" ? (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-ink/15 bg-white p-1"
          />
          <span className="font-mono text-xs text-ink-soft">{value}</span>
        </div>
      ) : field.kind === "select" ? (
        <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.kind === "range" ? (
        <div className="flex items-center gap-3">
          <input
            type="range"
            className="w-full"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value || "1"}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="w-14 text-right text-sm">{Math.round(Number(value || 1) * 100)} %</span>
        </div>
      ) : field.kind === "textarea" ? (
        <textarea className={input} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : demandes reçues (formulaire de contact + bandeau devis)    */
/* ------------------------------------------------------------------ */
type CartItem = { id: string; title: string; category?: string; unit_price: number | null; qty: number; line_total: number | null; logo_path: string; photo_path: string | null; note: string | null };

type Lead = {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  product: string | null;
  quantity: number | null;
  is_custom: boolean;
  user_id: string | null;
  logo_path: string | null;
  photo_path?: string | null;
  items?: CartItem[] | null;
  total_amount?: number | null;
  discount_percent?: number | null;
  phone: string | null;
  address: string | null;
  message: string | null;
  source: string;
  is_handled: boolean;
  created_at: string;
};


const UUID_FILE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp/g;

type Attachment = { path: string; label: string; kind: "logo" | "photo" | "autre" };

// Tous les fichiers envoyés par le client pour une demande : colonnes dédiées, détail du panier, et même
// les commandes enregistrées avant la mise à jour SQL (leurs fichiers sont notés dans le message).
function attachmentsOf(l: Lead): Attachment[] {
  const out: Attachment[] = [];
  const seen = new Set<string>();
  const add = (path: string | null | undefined, label: string, kind: Attachment["kind"]) => {
    if (path && !seen.has(path)) {
      seen.add(path);
      out.push({ path, label, kind });
    }
  };
  for (const it of l.items ?? []) {
    add(it.logo_path, `Logo · ${it.title}`, "logo");
    add(it.photo_path, `Photo de l'article · ${it.title}`, "photo");
  }
  add(l.logo_path, "Logo du client", "logo");
  add(l.photo_path, "Photo de l'article du client", "photo");
  const text = l.message ?? "";
  for (const m of text.matchAll(/(logo|photo)\s*:\s*([0-9a-f-]{36}\.webp)/gi)) {
    const isLogo = m[1].toLowerCase() === "logo";
    add(m[2], isLogo ? "Logo du client" : "Photo de l'article du client", isLogo ? "logo" : "photo");
  }
  for (const m of text.matchAll(UUID_FILE)) add(m[0], "Fichier joint", "autre");
  return out;
}

const waDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 && d.startsWith("0") ? "212" + d.slice(1) : d;
};

const fileUrl = (path: string, download?: string) =>
  `/api/admin/logo?path=${encodeURIComponent(path)}${download ? `&download=${download}` : ""}`;

function Preview({ path, alt }: { path: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-ink-soft">Aperçu indisponible : utilisez « Ouvrir »</span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={fileUrl(path)} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain p-2" />
  );
}

function AttachmentTile({ a }: { a: Attachment }) {
  const base = a.kind === "photo" ? "photo-article" : a.kind === "logo" ? "logo-client" : "fichier-client";
  return (
    <figure className="w-full min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
      <a href={fileUrl(a.path)} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-paper" title="Ouvrir en grand">
        <Preview path={a.path} alt={a.label} />
      </a>
      <figcaption className="border-t border-ink/10 p-2.5">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink [overflow-wrap:anywhere]" title={a.label}>{a.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={fileUrl(a.path)} target="_blank" rel="noopener noreferrer" className="min-w-[5.5rem] flex-1 rounded-md border border-ink/20 bg-white px-2 py-1.5 text-center text-xs font-semibold text-ink hover:bg-paper">Ouvrir</a>
          <a href={fileUrl(a.path, base)} className="min-w-[5.5rem] flex-1 rounded-md bg-water px-2 py-1.5 text-center text-xs font-semibold text-cream hover:opacity-90">Télécharger</a>
        </div>
      </figcaption>
    </figure>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "new" | "done" | "account" }) {
  const cls = tone === "new" ? "bg-water text-cream" : tone === "account" ? "bg-kraft text-ink" : "bg-ink/10 text-ink-soft";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

const sectionTitle = "text-xs font-bold uppercase tracking-[0.12em] text-ink-soft";

function LeadsTab({ ctx, onCount }: { ctx: Ctx; onCount: (n: number) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<"new" | "all">("new");
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    const base = "id,name,first_name,last_name,product,quantity,is_custom,user_id,logo_path,phone,address,message,source,is_handled,created_at";
    const query = (cols: string) => adminDb.from("leads").select(cols).order("created_at", { ascending: false }).limit(200);
    // Selon les mises à jour SQL déjà faites, certaines colonnes n'existent pas encore : on essaie de la plus complète à la plus simple.
    let { data, error } = await query(base + ",photo_path,items,total_amount,discount_percent");
    if (error) ({ data, error } = await query(base + ",photo_path"));
    if (error) ({ data, error } = await query(base));
    setProblem(
      error
        ? `Impossible de lire les demandes (${error.message}). Avez-vous exécuté le fichier landpack-v2.sql dans Supabase ?`
        : "",
    );
    const rows = (data ?? []) as Lead[];
    setLeads(rows);
    onCount(rows.filter((l) => !l.is_handled).length);
  }, [onCount]);

  useEffect(() => {
    // Chargement initial des demandes à l'ouverture de l'onglet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function toggle(l: Lead) {
    const { error } = await adminDb.from("leads").update({ is_handled: !l.is_handled }).eq("id", l.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  async function remove(l: Lead) {
    if (!confirm("Supprimer cette demande définitivement ?")) return;
    const { error } = await adminDb.from("leads").delete().eq("id", l.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  if (!leads) return <p className="text-sm">Chargement…</p>;

  const shown = leads.filter((l) => filter === "all" || !l.is_handled);
  const fresh = leads.filter((l) => !l.is_handled).length;
  const tab = (active: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-water text-cream shadow-sm" : "text-ink hover:bg-ink/5"}`;

  return (
    <div className="space-y-5">
      {problem && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{problem}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-xl border border-ink/10 bg-paper p-1" role="tablist" aria-label="Filtre des demandes">
          <button role="tab" aria-selected={filter === "new"} className={tab(filter === "new")} onClick={() => setFilter("new")}>
            Nouvelles ({fresh})
          </button>
          <button role="tab" aria-selected={filter === "all"} className={tab(filter === "all")} onClick={() => setFilter("all")}>
            Toutes ({leads.length})
          </button>
        </div>
        <button className={btnGhost} onClick={load}>Actualiser</button>
      </div>
      <p className="text-sm text-ink-soft">
        Les commandes envoyées depuis le site apparaissent ici, avec le logo et la photo de l&apos;article du client. Ce sont des données
        personnelles : ne les partagez pas et supprimez-les une fois traitées.
      </p>

      {shown.length === 0 && !problem && (
        <p className="rounded-2xl border border-ink/10 bg-paper p-8 text-center text-sm text-ink-soft">
          {filter === "new" ? "Aucune nouvelle demande." : "Aucune demande pour le moment."}
        </p>
      )}

      {shown.map((l) => {
        const who = `${l.first_name ?? ""} ${l.last_name ?? ""}`.trim() || l.name || "Sans nom";
        const files = attachmentsOf(l);
        const shownMessage = (l.message ?? "").replace(UUID_FILE, "fichier joint").trim();
        return (
          <article
            key={l.id}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${l.is_handled ? "border-ink/10" : "border-water/60 ring-1 ring-water/20"}`}
          >
            {/* En-tête : qui, quand, état */}
            <header className={`flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-3.5 ${l.is_handled ? "bg-paper" : "bg-paper"}`}>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-ink">{who}</h3>
                <p className="text-xs text-ink-soft">
                  {new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })} · {l.source}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {l.user_id && <Pill tone="account">Client avec compte</Pill>}
                {l.is_handled ? <Pill tone="done">Traitée</Pill> : <Pill tone="new">Nouvelle</Pill>}
              </div>
            </header>

            {/* Client et commande */}
            <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
              <section className="min-w-0 space-y-3">
                <h4 className={sectionTitle}>Client</h4>
                {l.phone && (
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="rounded-lg bg-water px-3.5 py-2 text-sm font-semibold text-cream hover:opacity-90">
                      Appeler · {l.phone}
                    </a>
                    <a href={`https://wa.me/${waDigits(l.phone)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-ink/20 bg-white px-3.5 py-2 text-sm font-semibold text-ink hover:bg-paper">
                      WhatsApp
                    </a>
                  </div>
                )}
                {l.address && (
                  <p className="whitespace-pre-wrap text-sm text-ink">
                    <span className="block text-xs font-semibold text-ink-soft">Adresse de livraison</span>
                    {l.address}
                  </p>
                )}
              </section>

              <section className="min-w-0 space-y-3">
                <h4 className={sectionTitle}>Commande</h4>
                {l.items && l.items.length > 0 ? (
                  <ul className="divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/10">
                    {l.items.map((it, n) => (
                      <li key={n} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 bg-white px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink [overflow-wrap:anywhere]">{it.title}</p>
                          <p className="text-xs text-ink-soft">
                            {fmtInt(it.qty)} pièces{it.unit_price != null ? ` × ${money(it.unit_price)}` : " · sur devis"}
                            {it.note ? ` · ${it.note}` : ""}
                          </p>
                        </div>
                        <p className="font-semibold text-ink">{it.line_total != null ? money(it.line_total) : ""}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  l.product && (
                    <p className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
                      <span className="font-semibold text-ink [overflow-wrap:anywhere]">{l.product}</span>
                      {l.quantity ? <span className="text-ink-soft"> · {fmtInt(l.quantity)} pièces</span> : null}
                    </p>
                  )
                )}
                {l.total_amount != null && (
                  <div className="flex items-baseline justify-between gap-3 rounded-xl bg-paper px-4 py-3">
                    <span className="text-sm font-semibold text-ink">
                      Total{l.discount_percent ? ` (remise de ${l.discount_percent} % incluse)` : ""}
                    </span>
                    <span className="font-display text-xl text-ink">{money(Number(l.total_amount))}</span>
                  </div>
                )}
              </section>
            </div>

            {/* Fichiers du client : aperçus */}
            {files.length > 0 && (
              <section className="border-t border-ink/10 px-5 py-4">
                <h4 className={sectionTitle}>Fichiers du client ({files.length})</h4>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {files.map((f) => (
                    <AttachmentTile key={f.path} a={f} />
                  ))}
                </div>
              </section>
            )}

            {shownMessage && (
              <section className="border-t border-ink/10 px-5 py-4">
                <h4 className={sectionTitle}>Précisions du client</h4>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-paper p-3.5 text-sm text-ink [overflow-wrap:anywhere]">{shownMessage}</p>
              </section>
            )}

            <footer className="flex flex-wrap gap-2 border-t border-ink/10 bg-paper px-5 py-3.5">
              <button className={btn} onClick={() => toggle(l)}>{l.is_handled ? "Remettre en nouvelle" : "Marquer comme traitée"}</button>
              <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50" onClick={() => remove(l)}>
                Supprimer
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet 1 : pages et textes (piloté par lib/content.ts)              */
/* ------------------------------------------------------------------ */
function PagesTab({ ctx }: { ctx: Ctx }) {
  const [page, setPage] = useState("home");
  const [rows, setRows] = useState<SectionRow[] | null>(null);
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await adminDb
      .from("site_sections")
      .select("id,section,sort_order,is_active,data")
      .order("sort_order");
    setProblem(
      error
        ? `Impossible de lire les contenus (${error.message}). Avez-vous exécuté le fichier landpack-sections.sql dans Supabase ?`
        : "",
    );
    setRows(((data ?? []) as SectionRow[]));
  }, []);

  useEffect(() => {
    // Chargement initial des contenus à l'ouverture de l'onglet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!rows) return <p className="text-sm">Chargement…</p>;

  const defs = SECTION_DEFS.filter((d) => d.page === page);

  return (
    <div className="space-y-4">
      {problem && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{problem}</p>}
      <select className={input} value={page} onChange={(e) => setPage(e.target.value)}>
        {Object.entries(PAGES).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <p className="text-sm text-ink-soft">
        Chaque bloc correspond à une zone du site. Ouvrez un bloc, modifiez, puis cliquez sur « Enregistrer » : le site est mis à jour aussitôt.
        Les catégories, modèles, dimensions et prix se modifient dans l&apos;onglet « Catalogue », le téléphone, l&apos;adresse et le logo dans « Coordonnées & logo ».
      </p>
      {defs.map((def) => {
        const mine = rows.filter((r) => r.section === def.id);
        return (
          <details key={def.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
            <summary className="cursor-pointer text-sm font-medium">{def.label}</summary>
            <div className="mt-4 space-y-3">
              {def.hint && <p className="text-xs text-ink-soft">{def.hint}</p>}
              {def.mode === "single" ? (
                <SingleEditor key={mine[0]?.id ?? "new"} def={def} row={mine[0]} reload={load} ctx={ctx} />
              ) : (
                <ListEditor def={def} rows={mine} reload={load} ctx={ctx} />
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function SingleEditor({ def, row, reload, ctx }: { def: SectionDef; row?: SectionRow; reload: () => Promise<void>; ctx: Ctx }) {
  const [vals, setVals] = useState<Record<string, string>>({ ...(def.defaults[0] ?? {}), ...(row?.data ?? {}) });
  const [busy, setBusy] = useState(false);

  async function save(next?: Record<string, string>) {
    const data = next ?? vals;
    setBusy(true);
    const db = adminDb;
    const { error } = row
      ? await db.from("site_sections").update({ data }).eq("id", row.id)
      : await db.from("site_sections").insert({ section: def.id, data, sort_order: 0 });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await reload();
      ctx.notify("Enregistré. Le site est mis à jour.");
    }
    setBusy(false);
  }

  function resetToDefaults() {
    if (!confirm("Rétablir les valeurs d'origine ?")) return;
    const d = def.defaults[0] ?? {};
    setVals(d);
    save(d);
  }

  return (
    <>
      {def.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={vals[f.key] ?? ""} onChange={(v) => setVals({ ...vals, [f.key]: v })} ctx={ctx} preset={def.id === "home.slides" ? "slide" : "generic"} />
      ))}
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={() => save()} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
        {def.resettable && (
          <button className={btnGhost} onClick={resetToDefaults} disabled={busy}>Rétablir les valeurs d&apos;origine</button>
        )}
      </div>
    </>
  );
}

function ListEditor({ def, rows, reload, ctx }: { def: SectionDef; rows: SectionRow[]; reload: () => Promise<void>; ctx: Ctx }) {
  const seeded = useRef(false);

  // Première ouverture : on copie le contenu actuel du site dans la base,
  // pour que l'admin affiche exactement ce que voient les visiteurs.
  useEffect(() => {
    if (rows.length > 0 || seeded.current) return;
    seeded.current = true;
    (async () => {
      const { error } = await adminDb
        .from("site_sections")
        .insert(def.defaults.map((data, i) => ({ section: def.id, data, sort_order: i })));
      if (error) ctx.notify("Erreur : " + error.message, false);
      await reload();
    })();
  }, [rows.length, def, reload, ctx]);

  async function add() {
    const first = def.fields[0].key;
    const data = Object.fromEntries(def.fields.map((f) => [f.key, f.key === first ? "Nouvel élément" : ""]));
    const next = rows.reduce((m, r) => Math.max(m, r.sort_order), -1) + 1;
    const { error } = await adminDb.from("site_sections").insert({ section: def.id, data, sort_order: next });
    if (error) ctx.notify("Erreur : " + error.message, false);
    await reload();
  }

  return (
    <>
      {rows.map((r) => (
        <ItemEditor key={r.id} def={def} row={r} canDelete={rows.length > 1} reload={reload} ctx={ctx} />
      ))}
      <button className={btn} onClick={add}>+ Ajouter un élément</button>
    </>
  );
}

function ItemEditor({ def, row, canDelete, reload, ctx }: { def: SectionDef; row: SectionRow; canDelete: boolean; reload: () => Promise<void>; ctx: Ctx }) {
  const [vals, setVals] = useState<Record<string, string>>(row.data);
  const [active, setActive] = useState(row.is_active);
  const [order, setOrder] = useState(row.sort_order);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await adminDb
      .from("site_sections")
      .update({ data: vals, is_active: active, sort_order: order })
      .eq("id", row.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await reload();
      ctx.notify("Enregistré. Le site est mis à jour.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!canDelete) return ctx.notify("Gardez au moins un élément : décochez « Visible » pour le masquer.", false);
    if (!confirm("Supprimer cet élément définitivement ?")) return;
    const { error } = await adminDb.from("site_sections").delete().eq("id", row.id);
    if (error) return ctx.notify("Erreur : " + error.message, false);
    await reload();
  }

  return (
    <div className="space-y-3 rounded-xl border border-ink/10 bg-white p-3">
      {def.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={vals[f.key] ?? ""} onChange={(v) => setVals({ ...vals, [f.key]: v })} ctx={ctx} preset={def.id === "home.slides" ? "slide" : "generic"} />
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Visible
        </label>
        <label className="flex items-center gap-2 text-sm">
          Ordre
          <input className={`${input} w-20`} type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} />
        </label>
        <button className={btn} onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button>
        <button className={btnGhost} onClick={remove} disabled={busy}>Supprimer</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : catalogue = catégories, chacune avec ses modèles           */
/* ------------------------------------------------------------------ */
type CatRow = Category & { id: string };
type ModelRow = Product & { id: string };

const slugify = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "categorie";
const posInt = (v: string): number | null => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : null;
};

function CatalogueTab({ ctx }: { ctx: Ctx }) {
  const [cats, setCats] = useState<CatRow[] | null>(null);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [problem, setProblem] = useState("");
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const catCols = "id,slug,name,description,image_url,is_active,sort_order";
    const prodCols =
      "id,category_id,name,dimensions,description,image_url,unit_price,price_label,min_qty,custom_price_label,custom_min_qty,is_active,sort_order";
    const fetchAll = () =>
      Promise.all([
        adminDb.from("categories").select(catCols).order("sort_order"),
        adminDb.from("products").select(prodCols).order("sort_order").order("created_at"),
      ]);

    let [c, p] = await fetchAll();
    const err = c.error ?? p.error;
    setProblem(err ? `Impossible de lire le catalogue (${err.message}). Avez-vous exécuté le fichier landpack-v2.sql dans Supabase ?` : "");

    // Première ouverture avec une base vide : on copie le catalogue d'origine.
    if (!err && !c.data?.length && !p.data?.length && !seeded.current) {
      seeded.current = true;
      await adminDb.from("categories").insert(DEFAULT_CATEGORIES);
      const created = await adminDb.from("categories").select("id,slug");
      const idBySlug = new Map<string, string>((created.data ?? []).map((r: { id: string; slug: string }) => [r.slug, r.id]));
      await adminDb.from("products").insert(
        defaultProducts().map((item) => {
          const { category_slug: slug, ...rest } = item;
          return { ...rest, category_id: idBySlug.get(slug) ?? null };
        }),
      );
      [c, p] = await fetchAll();
    }
    setCats((c.data ?? []) as CatRow[]);
    setModels((p.data ?? []) as ModelRow[]);
  }, []);

  useEffect(() => {
    // Chargement initial du catalogue à l'ouverture de l'onglet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function addCategory() {
    const slug = `nouvelle-categorie-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await adminDb
      .from("categories")
      .insert({ slug, name: "Nouvelle catégorie", description: "", sort_order: cats?.length ?? 0, is_active: true });
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  if (!cats) return <p className="text-sm">Chargement…</p>;

  return (
    <div className="space-y-4">
      {problem && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{problem}</p>}
      <p className="text-sm text-ink-soft">
        Chaque catégorie contient des modèles (dimensions, photo, prix et quantité minimale). Le client peut commander
        chaque modèle <strong>personnalisé avec son logo</strong> (Landpack ne fait que la personnalisation). Un modèle ou une
        catégorie décochés « Visible » n&apos;apparaissent pas sur le site.
      </p>
      <PricingBox ctx={ctx} />
      <button className={btn} onClick={addCategory}>+ Ajouter une catégorie</button>
      {cats.map((c) => (
        <CategoryBlock key={c.id} cat={c} models={models.filter((m) => m.category_id === c.id)} ctx={ctx} reload={load} />
      ))}
    </div>
  );
}

const PRICING_FIELDS = [
  ["qty_min", "Quantité minimale par défaut (pièces)", "50"],
  ["qty_step", "Palier de quantité (50 = 50, 100, 150, 200…)", "50"],
  ["discount_threshold", "Remise à partir de (pièces, 0 = aucune remise)", "1000"],
  ["discount_percent", "Pourcentage de remise (ex. 15)", "15"],
] as const;

// Règles de prix du site : quantités par paliers et remise sur grosse commande.
function PricingBox({ ctx }: { ctx: Ctx }) {
  const [values, setValues] = useState<Record<string, string>>({
    qty_min: DEFAULT_SETTINGS.qty_min, qty_step: DEFAULT_SETTINGS.qty_step,
    discount_threshold: DEFAULT_SETTINGS.discount_threshold, discount_percent: DEFAULT_SETTINGS.discount_percent,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminDb
      .from("site_settings")
      .select("key,value")
      .then(({ data }) => {
        if (!data?.length) return;
        const wanted = new Set(PRICING_FIELDS.map((f) => f[0]));
        setValues((v) => ({ ...v, ...Object.fromEntries(data.filter((r: { key: string }) => wanted.has(r.key as never)).map((r: { key: string; value: string }) => [r.key, r.value])) }));
      });
  }, []);

  async function save() {
    setBusy(true);
    const rows = PRICING_FIELDS.map(([key]) => ({ key, value: String(Math.max(0, Number(String(values[key]).replace(",", ".")) || 0)) }));
    const { error } = await adminDb.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else ctx.notify("Tarifs et remises enregistrés. Le site est mis à jour.");
    setBusy(false);
  }

  const pct = Number(values.discount_percent) || 0;
  return (
    <details open className="rounded-2xl border border-ink/10 bg-paper p-4">
      <summary className="cursor-pointer text-sm font-medium">Tarifs et remises (pour tout le site)</summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRICING_FIELDS.map(([key, text, placeholder]) => (
          <Labeled key={key} text={text}>
            <input className={input} type="number" min={0} step="any" inputMode="decimal" value={values[key] ?? ""} placeholder={placeholder} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
          </Labeled>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        Exemple avec ces réglages : {Number(values.discount_threshold) || 0} pièces à 1,20 Dh = {(((Number(values.discount_threshold) || 0) * 1.2)).toFixed(2)} Dh, remise de {pct} % : total{" "}
        {(((Number(values.discount_threshold) || 0) * 1.2) * (1 - pct / 100)).toFixed(2)} Dh. La remise s&apos;applique à toute la commande dès que le nombre total de pièces atteint le seuil. Le prix par pièce de chaque article se règle dans sa fiche, plus bas.
      </p>
      <div className="mt-3">
        <button className={btn} onClick={save} disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer les tarifs"}</button>
      </div>
    </details>
  );
}

function Labeled({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{text}</span>
      {children}
    </label>
  );
}

function CategoryBlock({ cat, models, ctx, reload }: { cat: CatRow; models: ModelRow[]; ctx: Ctx; reload: () => Promise<void> }) {
  const [c, setC] = useState(cat);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Category>(k: K, v: Category[K]) => setC((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    const values: Record<string, unknown> = {
      name: c.name,
      description: c.description?.trim() || null,
      image_url: c.image_url,
      is_active: c.is_active,
      sort_order: c.sort_order,
    };
    // Le lien interne de la catégorie (#boites-pizza) suit son nom la première fois.
    const fresh = cat.slug.startsWith("nouvelle-categorie");
    let res = await adminDb.from("categories").update(fresh ? { ...values, slug: slugify(c.name) } : values).eq("id", c.id);
    if (res.error && fresh) {
      res = await adminDb.from("categories").update({ ...values, slug: `${slugify(c.name)}-${Math.random().toString(36).slice(2, 5)}` }).eq("id", c.id);
    }
    if (res.error) ctx.notify("Erreur : " + res.error.message, false);
    else {
      await reload();
      ctx.notify("Catégorie enregistrée. Le site est mis à jour.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Supprimer « ${c.name} » et ses ${models.length} modèle(s) définitivement ?`)) return;
    setBusy(true);
    const a = await adminDb.from("products").delete().eq("category_id", c.id);
    const b = a.error ? a : await adminDb.from("categories").delete().eq("id", c.id);
    if (b.error) ctx.notify("Erreur : " + b.error.message, false);
    await reload();
    setBusy(false);
  }

  const [justAdded, setJustAdded] = useState<string | null>(null);
  const nextOrder = models.reduce((m, x) => Math.max(m, x.sort_order), -1) + 1;
  // Le modèle le plus récent (ordre le plus élevé) : il s'ouvre tout seul après un ajout ou une duplication.
  const newestId = models.length ? models.reduce((a, b) => (b.sort_order >= a.sort_order ? b : a)).id : null;

  return (
    <details className="rounded-2xl border border-ink/10 bg-paper p-4">
      <summary className="cursor-pointer text-sm font-medium">
        {cat.name} <span className="font-normal text-ink-soft">({models.length} modèle{models.length > 1 ? "s" : ""}{cat.is_active ? "" : ", masquée"})</span>
      </summary>

      <div className="mt-4 space-y-4">
        <div className="space-y-3 rounded-xl border border-ink/10 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">La catégorie</p>
          <Labeled text="Nom de la catégorie">
            <input className={input} value={c.name} onChange={(e) => set("name", e.target.value)} />
          </Labeled>
          <Labeled text="Description de la catégorie (affichée sur sa page ; les retours à la ligne sont conservés)">
            <textarea className={input} rows={5} value={c.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Labeled>
          <Labeled text="Photo de la catégorie">
            <ImageField
              value={c.image_url ?? ""}
              onChange={(v) => set("image_url", v)}
              ctx={ctx}
              preset="category"
              autoSave={async (url) => (await adminDb.from("categories").update({ image_url: url }).eq("id", c.id)).error?.message ?? null}
            />
          </Labeled>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={c.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm">
              Ordre
              <input className={`${input} w-20`} type="number" value={c.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
            </label>
            <button className={btn} onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer la catégorie"}</button>
            <button className={btnGhost} onClick={remove} disabled={busy}>Supprimer la catégorie</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Les modèles de cette catégorie ({models.length})
          </p>
          <p className="text-xs text-ink-soft">Cliquez sur un modèle pour le modifier.</p>
        </div>
        {models.map((m) => (
          <ModelCard key={m.id} item={m} ctx={ctx} reload={reload} nextOrder={nextOrder} onDuplicated={setJustAdded} startOpen={justAdded === "__dernier__" && m.id === newestId} />
        ))}
        <NewModelPanel cat={c} nextOrder={nextOrder} ctx={ctx} reload={reload} onAdded={setJustAdded} />
      </div>
    </details>
  );
}

const money2 = (n: number | null | undefined) => (n == null ? "sur devis" : `${Number(n).toFixed(2).replace(".", ",")} Dh`);

function ModelCard({
  item, ctx, reload, nextOrder, onDuplicated, startOpen,
}: { item: ModelRow; ctx: Ctx; reload: () => Promise<void>; nextOrder: number; onDuplicated: (id: string) => void; startOpen: boolean }) {
  const [m, setM] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setM((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v ? Number(v) : null);

  async function save() {
    setBusy(true);
    const { error } = await adminDb
      .from("products")
      .update({
        name: m.name,
        dimensions: m.dimensions?.trim() || null,
        description: m.description?.trim() || null,
        image_url: m.image_url,
        unit_price: m.unit_price != null && Number(m.unit_price) >= 0 ? Math.round(Number(m.unit_price) * 100) / 100 : null,
        min_qty: posInt(String(m.min_qty ?? "")),
        is_active: m.is_active,
        sort_order: m.sort_order,
      })
      .eq("id", m.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else ctx.notify("Modèle enregistré. Le site est mis à jour.");
    setBusy(false);
  }

  // Copie ce modèle (même photo, même prix) pour créer vite un autre format, par exemple un sac kraft d'une autre dimension.
  async function duplicate() {
    setBusy(true);
    const { error } = await adminDb.from("products").insert({
      category_id: item.category_id,
      name: m.name,
      dimensions: "",
      description: m.description?.trim() || null,
      image_url: m.image_url,
      unit_price: m.unit_price,
      min_qty: m.min_qty,
      sort_order: nextOrder,
      is_active: false,
    });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await reload();
      ctx.notify("Copie créée, masquée pour l'instant : indiquez la nouvelle dimension, puis cochez « Visible » et enregistrez.");
    }
    setBusy(false);
    // la copie s'ouvre toute seule : on retrouve son identifiant au rechargement (la plus récente de la liste)
    onDuplicated("__dernier__");
  }

  async function remove() {
    if (!confirm(`Supprimer « ${m.name}${m.dimensions ? " – " + m.dimensions : ""} » définitivement ?`)) return;
    const { error } = await adminDb.from("products").delete().eq("id", m.id);
    if (error) return ctx.notify("Erreur : " + error.message, false);
    await reload();
  }

  const title = m.dimensions ? `${m.name} – ${m.dimensions}` : m.name;
  return (
    <details open={startOpen || undefined} className="group rounded-xl border border-ink/10 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
        <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-white">
          {m.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.image_url} alt="" className="h-full w-full object-contain" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{title}</span>
          <span className="block text-xs text-ink-soft">
            {money2(m.unit_price)} / pièce · min. {m.min_qty ?? "50"}
          </span>
        </span>
        {!m.is_active && <span className="shrink-0 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink-soft">Masqué</span>}
        <span aria-hidden className="shrink-0 text-ink-soft transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="space-y-3 border-t border-ink/10 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled text="Nom du modèle">
            <input className={input} value={m.name} onChange={(e) => set("name", e.target.value)} />
          </Labeled>
          <Labeled text="Dimensions ou contenance (ex. 30 × 30 × 4 cm, 12 oz)">
            <input className={input} value={m.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} />
          </Labeled>
        </div>
        <Labeled text="Description de l'article (affichée sur sa page ; les retours à la ligne sont conservés)">
          <textarea className={input} rows={5} value={m.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </Labeled>
        <Labeled text="Photo du modèle">
          <ImageField
            value={m.image_url ?? ""}
            onChange={(v) => set("image_url", v)}
            ctx={ctx}
            preset="product"
            autoSave={async (url) => (await adminDb.from("products").update({ image_url: url }).eq("id", m.id)).error?.message ?? null}
          />
        </Labeled>
        <div className="grid gap-3 sm:grid-cols-2">
          <Labeled text="Prix par pièce, en Dh (ex. 1.20). Vide : « sur devis »">
            <input className={input} type="number" min={0} step="0.01" inputMode="decimal" value={m.unit_price ?? ""} onChange={(e) => set("unit_price", e.target.value === "" ? null : Number(e.target.value))} />
          </Labeled>
          <Labeled text="Quantité minimale (vide : celle du site, 50 par défaut)">
            <input className={input} type="number" min={1} value={m.min_qty ?? ""} onChange={(e) => set("min_qty", num(e.target.value))} />
          </Labeled>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={m.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Visible sur le site
          </label>
          <label className="flex items-center gap-2 text-sm">
            Ordre
            <input className={`${input} w-20`} type="number" value={m.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button>
          <button className={btnGhost} onClick={duplicate} disabled={busy} title="Crée une copie pour un autre format">Dupliquer</button>
          <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" onClick={remove} disabled={busy}>Supprimer</button>
        </div>
      </div>
    </details>
  );
}

// Ajout d'un nouveau modèle dans une catégorie (ex. un nouveau sac kraft d'une autre dimension) : nom, dimensions, photo, prix.
function NewModelPanel({
  cat, nextOrder, ctx, reload, onAdded,
}: { cat: CatRow; nextOrder: number; ctx: Ctx; reload: () => Promise<void>; onAdded: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const blank = { name: "", dimensions: "", description: "", image_url: "", price: "" };
  const [f, setF] = useState(blank);

  async function add() {
    if (!f.name.trim()) return ctx.notify("Indiquez le nom du modèle (ex. « Sac kraft »).", false);
    if (!f.dimensions.trim()) return ctx.notify("Indiquez les dimensions ou la contenance (ex. « 40 × 18 × 50 cm »).", false);
    setBusy(true);
    const price = f.price.trim() === "" ? null : Math.round(Number(f.price.replace(",", ".")) * 100) / 100;
    const { error } = await adminDb.from("products").insert({
      category_id: cat.id,
      name: f.name.trim(),
      dimensions: f.dimensions.trim(),
      description: f.description.trim() || null,
      image_url: f.image_url || cat.image_url,
      unit_price: price != null && Number.isFinite(price) && price >= 0 ? price : null,
      sort_order: nextOrder,
      is_active: true,
    });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await reload();
      ctx.notify("Nouveau modèle ajouté : il est déjà visible sur le site.");
      onAdded("__dernier__");
      setF(blank);
      setOpen(false);
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button className={btn} onClick={() => setOpen(true)}>+ Ajouter un nouveau modèle dans « {cat.name} »</button>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border-2 border-water/50 bg-white p-4">
      <p className="text-sm font-semibold text-ink">Nouveau modèle dans « {cat.name} »</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled text="Nom du modèle (ex. Sac kraft)">
          <input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Labeled>
        <Labeled text="Dimensions ou contenance (ex. 40 × 18 × 50 cm)">
          <input className={input} value={f.dimensions} onChange={(e) => setF({ ...f, dimensions: e.target.value })} />
        </Labeled>
      </div>
      <Labeled text="Photo du modèle">
        <ImageField value={f.image_url} onChange={(v) => setF({ ...f, image_url: v })} ctx={ctx} preset="product" clearable />
      </Labeled>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled text="Prix par pièce, en Dh (facultatif)">
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="1.20" />
        </Labeled>
      </div>
      <Labeled text="Description (facultative)">
        <textarea className={input} rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </Labeled>
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={add} disabled={busy}>{busy ? "Ajout…" : "Ajouter ce modèle"}</button>
        <button className={btnGhost} onClick={() => { setOpen(false); setF(blank); }} disabled={busy}>Annuler</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet 3 : coordonnées                                              */
/* ------------------------------------------------------------------ */
const FIELDS = [
  ["phone", "Téléphone affiché sur le site", "+212673326244"],
  ["whatsapp", "Numéro WhatsApp (chiffres seulement, avec l'indicatif)", "212673326244"],
  ["email", "E-mail public (laisser vide pour ne pas l'afficher sur le site)", ""],
  ["address", "Adresse (utilisée aussi pour la carte Google)", "Quartier, ville"],
] as const;

function SettingsTab({ ctx }: { ctx: Ctx }) {
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminDb
      .from("site_settings")
      .select("key,value")
      .then(({ data }) => {
        if (data?.length) setValues((v) => ({ ...v, ...Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value])) }));
      });
  }, []);

  async function save() {
    setBusy(true);
    const clean = {
      ...values,
      phone: values.phone.replace(/\s/g, ""),
      whatsapp: values.whatsapp.replace(/\D/g, ""),
    };
    const rows = Object.entries(clean).map(([key, value]) => ({ key, value }));
    const { error } = await adminDb.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      setValues(clean);
      ctx.notify("Coordonnées enregistrées. Le site est mis à jour.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-paper p-6">
      {FIELDS.map(([key, label, placeholder]) => (
        <label key={key} className="block">
          <span className="mb-1 block text-sm font-medium">{label}</span>
          <input className={input} value={values[key] ?? ""} placeholder={placeholder} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
        </label>
      ))}
      <div>
        <span className="mb-1 block text-sm font-medium">Logo du site</span>
        <ImageField value={values.logo_url ?? ""} onChange={(v) => setValues({ ...values, logo_url: v })} ctx={ctx} preset="logo" />
        <p className="mt-2 text-xs text-ink-soft">
          Image convertie en WebP (le fond transparent est conservé). Par défaut, le site utilise le fichier public/assets/logo.webp.
        </p>
      </div>
      <button className={btn} onClick={save} disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
