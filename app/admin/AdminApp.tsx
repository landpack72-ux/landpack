"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/browser";
import { PAGES, SECTION_DEFS, type Field, type SectionDef } from "@/lib/content";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, type Product } from "@/lib/defaults";
import { uploadImage } from "./image";

type Row<T> = T & { id: string };
type SectionRow = {
  id: string;
  section: string;
  sort_order: number;
  is_active: boolean;
  data: Record<string, string>;
};
type Ctx = { notify: (msg: string, ok?: boolean) => void; publish: () => Promise<void> };

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const input =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-water";
const btn =
  "rounded-lg bg-water px-4 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm text-ink transition-colors hover:bg-cream disabled:opacity-50";

/* ------------------------------------------------------------------ */
/* Écran principal : connexion, vérification admin, onglets            */
/* ------------------------------------------------------------------ */
export default function AdminApp() {
  const [state, setState] = useState<"loading" | "out" | "denied" | "in">("loading");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"leads" | "pages" | "products" | "settings">("leads");
  const [newCount, setNewCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Demande au site de se mettre à jour (route /api/revalidate, réservée aux admins).
  const publish = useCallback(async () => {
    const { data } = await getBrowserClient().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, []);

  const check = useCallback(async (session: Session | null) => {
    if (!session) {
      setState("out");
      return;
    }
    setEmail(session.user.email ?? "");
    const { data, error } = await getBrowserClient().rpc("is_admin");
    setState(!error && data === true ? "in" : "denied");
  }, []);

  useEffect(() => {
    if (!configured) return;
    const db = getBrowserClient();
    db.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => check(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [check]);

  useEffect(() => {
    if (state !== "in") return;
    getBrowserClient()
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("is_handled", false)
      .then(({ count }) => setNewCount(count ?? 0));
  }, [state]);

  const ctx = useMemo<Ctx>(() => ({ notify, publish }), [notify, publish]);

  if (!configured) {
    return (
      <Centered>
        <p className="text-sm">
          Supabase n&apos;est pas configuré : ajoutez NEXT_PUBLIC_SUPABASE_URL et
          NEXT_PUBLIC_SUPABASE_ANON_KEY dans les variables d&apos;environnement.
        </p>
      </Centered>
    );
  }
  if (state === "loading") return <Centered>Chargement…</Centered>;
  if (state === "out") return <Login />;

  if (state === "denied") {
    return (
      <Centered>
        <p className="text-sm">
          Le compte <strong>{email}</strong> n&apos;a pas les droits d&apos;administration.
        </p>
        <button className={`${btnGhost} mt-4`} onClick={() => getBrowserClient().auth.signOut()}>
          Se déconnecter
        </button>
      </Centered>
    );
  }

  const tabs = [
    ["leads", newCount > 0 ? `Demandes (${newCount})` : "Demandes"],
    ["pages", "Pages & textes"],
    ["products", "Catalogue & prix"],
    ["settings", "Coordonnées"],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Administration Landpack</h1>
          <p className="text-sm text-ink-soft">Connecté : {email}</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className={btnGhost}>
            Voir le site
          </a>
          <button className={btnGhost} onClick={() => getBrowserClient().auth.signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>

      <nav className="mt-6 flex gap-2 border-b border-ink/10">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === key ? "border-water font-medium text-water" : "border-transparent text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mt-6">
        {tab === "leads" && <LeadsTab ctx={ctx} onCount={setNewCount} />}
        {tab === "pages" && <PagesTab ctx={ctx} />}
        {tab === "products" && <ProductsTab ctx={ctx} />}
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
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      console.error("Erreur Supabase Auth :", error.message);
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou mot de passe incorrect."
          : error.message,
      );
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
function ImageField({ value, onChange, ctx }: { value: string; onChange: (v: string) => void; ctx: Ctx }) {
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(getBrowserClient(), file, "content"));
      ctx.notify("Photo envoyée. Cliquez sur « Enregistrer » pour la publier.");
    } catch (e) {
      ctx.notify(e instanceof Error ? e.message : "Échec de l'envoi de la photo.", false);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-28 rounded-lg object-cover" />
      ) : (
        <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-cream text-xs text-ink-soft">Pas de photo</div>
      )}
      <label className={`${btnGhost} cursor-pointer`}>
        {busy ? "Envoi…" : "Changer la photo"}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
    </div>
  );
}

function FieldInput({ field, value, onChange, ctx }: { field: Field; value: string; onChange: (v: string) => void; ctx: Ctx }) {
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
        <ImageField value={value} onChange={onChange} ctx={ctx} />
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
type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  is_handled: boolean;
  created_at: string;
};

function LeadsTab({ ctx, onCount }: { ctx: Ctx; onCount: (n: number) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<"new" | "all">("new");
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await getBrowserClient()
      .from("leads")
      .select("id,name,email,phone,message,source,is_handled,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setProblem(
      error
        ? `Impossible de lire les demandes (${error.message}). Avez-vous exécuté le fichier landpack-leads.sql dans Supabase ?`
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
    const { error } = await getBrowserClient().from("leads").update({ is_handled: !l.is_handled }).eq("id", l.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  async function remove(l: Lead) {
    if (!confirm("Supprimer cette demande définitivement ?")) return;
    const { error } = await getBrowserClient().from("leads").delete().eq("id", l.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  if (!leads) return <p className="text-sm">Chargement…</p>;

  const shown = leads.filter((l) => filter === "all" || !l.is_handled);
  const fresh = leads.filter((l) => !l.is_handled).length;

  return (
    <div className="space-y-4">
      {problem && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{problem}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <select className={`${input} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value as "new" | "all")}>
          <option value="new">Nouvelles demandes ({fresh})</option>
          <option value="all">Toutes les demandes ({leads.length})</option>
        </select>
        <button className={btnGhost} onClick={load}>Actualiser</button>
      </div>
      <p className="text-sm text-ink-soft">
        Les demandes envoyées depuis le site apparaissent ici. Pensez à venir les consulter régulièrement.
      </p>

      {shown.length === 0 && !problem && (
        <p className="rounded-2xl border border-ink/10 bg-paper p-6 text-center text-sm text-ink-soft">
          {filter === "new" ? "Aucune nouvelle demande." : "Aucune demande pour le moment."}
        </p>
      )}

      {shown.map((l) => (
        <div key={l.id} className={`space-y-2 rounded-2xl border p-4 ${l.is_handled ? "border-ink/10 bg-paper" : "border-water bg-white"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
            <span>
              {new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {l.source}
            </span>
            {!l.is_handled && <span className="rounded-full bg-water px-2 py-0.5 text-cream">Nouvelle</span>}
          </div>
          <p className="font-medium">{l.name || "Sans nom"}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {l.email && <a className="text-water underline" href={`mailto:${l.email}`}>{l.email}</a>}
            {l.phone && <a className="text-water underline" href={`tel:${l.phone.replace(/\s/g, "")}`}>{l.phone}</a>}
          </div>
          {l.message && <p className="whitespace-pre-wrap rounded-lg bg-cream p-3 text-sm">{l.message}</p>}
          <div className="flex gap-2 pt-1">
            <button className={btn} onClick={() => toggle(l)}>{l.is_handled ? "Remettre en nouvelle" : "Marquer comme traitée"}</button>
            <button className={btnGhost} onClick={() => remove(l)}>Supprimer</button>
          </div>
        </div>
      ))}
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
    const { data, error } = await getBrowserClient()
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
        Chaque bloc correspond à une zone du site (et le style est dans « Style du site »). Ouvrez un bloc, modifiez, puis cliquez sur « Enregistrer » : le site est mis à jour aussitôt.
        Les produits et leurs prix se modifient dans l&apos;onglet « Catalogue & prix », le téléphone et l&apos;adresse dans « Coordonnées ».
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
    const db = getBrowserClient();
    const { error } = row
      ? await db.from("site_sections").update({ data }).eq("id", row.id)
      : await db.from("site_sections").insert({ section: def.id, data, sort_order: 0 });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
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
        <FieldInput key={f.key} field={f} value={vals[f.key] ?? ""} onChange={(v) => setVals({ ...vals, [f.key]: v })} ctx={ctx} />
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
      const { error } = await getBrowserClient()
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
    const { error } = await getBrowserClient().from("site_sections").insert({ section: def.id, data, sort_order: next });
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
    const { error } = await getBrowserClient()
      .from("site_sections")
      .update({ data: vals, is_active: active, sort_order: order })
      .eq("id", row.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
      await reload();
      ctx.notify("Enregistré. Le site est mis à jour.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!canDelete) return ctx.notify("Gardez au moins un élément : décochez « Visible » pour le masquer.", false);
    if (!confirm("Supprimer cet élément définitivement ?")) return;
    const { error } = await getBrowserClient().from("site_sections").delete().eq("id", row.id);
    if (error) return ctx.notify("Erreur : " + error.message, false);
    await ctx.publish();
    await reload();
  }

  return (
    <div className="space-y-3 rounded-xl border border-ink/10 bg-white p-3">
      {def.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={vals[f.key] ?? ""} onChange={(v) => setVals({ ...vals, [f.key]: v })} ctx={ctx} />
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
/* Onglet 2 : catalogue (photo, nom, description, prix)                */
/* ------------------------------------------------------------------ */
function ProductsTab({ ctx }: { ctx: Ctx }) {
  const [items, setItems] = useState<Row<Product>[] | null>(null);
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const db = getBrowserClient();
    const cols = "id,name,description,image_url,price_label,is_active,sort_order";
    const first = await db.from("products").select(cols).order("sort_order").order("created_at");
    const error = first.error;
    let data = first.data;
    if (error) ctx.notify("Erreur : " + error.message, false);
    // Première ouverture : on copie le catalogue actuel du site dans la base.
    if (!error && !data?.length && !seeded.current) {
      seeded.current = true;
      await db.from("products").insert(DEFAULT_PRODUCTS);
      const again = await db.from("products").select(cols).order("sort_order").order("created_at");
      data = again.data;
    }
    setItems((data as Row<Product>[]) ?? []);
  }, [ctx]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    const { error } = await getBrowserClient()
      .from("products")
      .insert({ name: "Nouveau produit", sort_order: items?.length ?? 0, is_active: true });
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  if (!items) return <p className="text-sm">Chargement…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Ces produits s&apos;affichent sur la page Personnalisation et dans la liste « Produits » du pied de page.
      </p>
      <button className={btn} onClick={add}>+ Ajouter un produit</button>
      {items.map((it) => (
        <ProductCard key={it.id} item={it} canDelete={items.length > 1} ctx={ctx} onChanged={load} />
      ))}
    </div>
  );
}

function ProductCard({ item, canDelete, ctx, onChanged }: { item: Row<Product>; canDelete: boolean; ctx: Ctx; onChanged: () => void }) {
  const [p, setP] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      set("image_url", await uploadImage(getBrowserClient(), file, "products"));
      ctx.notify("Photo envoyée. Cliquez sur « Enregistrer » pour la publier.");
    } catch (e) {
      ctx.notify(e instanceof Error ? e.message : "Échec de l'envoi de la photo.", false);
    }
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    const { error } = await getBrowserClient()
      .from("products")
      .update({
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        price_label: p.price_label?.trim() || null,
        is_active: p.is_active,
        sort_order: p.sort_order,
      })
      .eq("id", p.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
      ctx.notify("Produit enregistré. Le site est mis à jour.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!canDelete) return ctx.notify("Gardez au moins un produit : décochez « Visible » pour le masquer.", false);
    if (!confirm(`Supprimer « ${p.name} » définitivement ?`)) return;
    const { error } = await getBrowserClient().from("products").delete().eq("id", p.id);
    if (error) return ctx.notify("Erreur : " + error.message, false);
    await ctx.publish();
    onChanged();
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-ink/10 bg-paper p-4 sm:grid-cols-[9rem_1fr]">
      <div>
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt="" className="h-36 w-full rounded-lg object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center rounded-lg bg-cream text-xs text-ink-soft">Pas de photo</div>
        )}
        <label className={`${btnGhost} mt-2 block cursor-pointer text-center`}>
          Changer la photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
      <div className="space-y-3">
        <input className={input} value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Nom du produit" />
        <textarea className={input} rows={2} value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Description" />
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
          <input className={input} value={p.price_label ?? ""} onChange={(e) => set("price_label", e.target.value)} placeholder="Prix affiché (ex : À partir de 0,80 Dh, ou Sur devis)" />
          <input className={input} type="number" value={p.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} title="Ordre d'affichage" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Visible sur le site
          </label>
          <button className={btn} onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button>
          <button className={btnGhost} onClick={remove} disabled={busy}>Supprimer</button>
        </div>
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
  ["email", "E-mail de contact", "contact@exemple.com"],
  ["address", "Adresse (utilisée aussi pour la carte Google)", "Quartier, ville"],
] as const;

function SettingsTab({ ctx }: { ctx: Ctx }) {
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getBrowserClient()
      .from("site_settings")
      .select("key,value")
      .then(({ data }) => {
        if (data?.length) setValues((v) => ({ ...v, ...Object.fromEntries(data.map((r) => [r.key, r.value])) }));
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
    const { error } = await getBrowserClient().from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      setValues(clean);
      await ctx.publish();
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
      <button className={btn} onClick={save} disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
