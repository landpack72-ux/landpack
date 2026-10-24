"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/browser";
import {
  DEFAULT_BLOCKS,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  SECTIONS,
  type Block,
  type Product,
} from "@/lib/defaults";
import { uploadImage } from "./image";

type Row<T> = T & { id: string };
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
  const [tab, setTab] = useState<"settings" | "products" | "blocks">("settings");
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

  const ctx: Ctx = { notify, publish };

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
    ["settings", "Coordonnées"],
    ["products", "Catalogue & prix"],
    ["blocks", "Textes & listes"],
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
        {tab === "settings" && <SettingsTab ctx={ctx} />}
        {tab === "products" && <ProductsTab ctx={ctx} />}
        {tab === "blocks" && <BlocksTab ctx={ctx} />}
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
  return <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">{children}</div>;
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
  setError(error.message);
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
/* Onglet 1 : coordonnées                                              */
/* ------------------------------------------------------------------ */
const FIELDS = [
  ["phone", "Téléphone affiché sur le site", "+212673326244"],
  ["whatsapp", "Numéro WhatsApp (chiffres seulement, avec l'indicatif)", "212673326244"],
  ["email", "E-mail de contact", "contact@exemple.com"],
  ["address", "Adresse", "Quartier, ville"],
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

/* ------------------------------------------------------------------ */
/* Onglet 2 : catalogue (photo, nom, description, prix)                */
/* ------------------------------------------------------------------ */
function ProductsTab({ ctx }: { ctx: Ctx }) {
  const [items, setItems] = useState<Row<Product>[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getBrowserClient()
      .from("products")
      .select("id,name,description,image_url,price_label,is_active,sort_order")
      .order("sort_order")
      .order("created_at");
    if (error) ctx.notify("Erreur : " + error.message, false);
    setItems((data as Row<Product>[]) ?? []);
  }, [ctx]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add() {
    const { error } = await getBrowserClient()
      .from("products")
      .insert({ name: "Nouveau produit", sort_order: items?.length ?? 0, is_active: true });
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  async function importDefaults() {
    const { error } = await getBrowserClient().from("products").insert(DEFAULT_PRODUCTS);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
      ctx.notify("Catalogue actuel chargé.");
    }
    await load();
  }

  if (!items) return <p className="text-sm">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={add}>+ Ajouter un produit</button>
        {items.length === 0 && (
          <button className={btnGhost} onClick={importDefaults}>Charger le catalogue actuel du site</button>
        )}
      </div>
      {items.map((it) => (
        <ProductCard key={it.id} item={it} ctx={ctx} onChanged={load} />
      ))}
    </div>
  );
}

function ProductCard({ item, ctx, onChanged }: { item: Row<Product>; ctx: Ctx; onChanged: () => void }) {
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
/* Onglet 3 : textes et listes (solutions, machines, consommables…)    */
/* ------------------------------------------------------------------ */
function BlocksTab({ ctx }: { ctx: Ctx }) {
  const [section, setSection] = useState("home_solutions");
  const [items, setItems] = useState<Row<Block>[] | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    const { data, error } = await getBrowserClient()
      .from("content_blocks")
      .select("id,section,title,body,is_active,sort_order")
      .eq("section", section)
      .order("sort_order")
      .order("updated_at");
    if (error) ctx.notify("Erreur : " + error.message, false);
    setItems((data as Row<Block>[]) ?? []);
  }, [section, ctx]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  async function add() {
    const { error } = await getBrowserClient()
      .from("content_blocks")
      .insert({ section, title: "Nouvel élément", body: "", sort_order: items?.length ?? 0, is_active: true });
    if (error) ctx.notify("Erreur : " + error.message, false);
    await load();
  }

  async function importDefaults() {
    const rows = DEFAULT_BLOCKS.filter((b) => b.section === section);
    const { error } = await getBrowserClient().from("content_blocks").insert(rows);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
      ctx.notify("Contenu actuel chargé.");
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <select className={input} value={section} onChange={(e) => setSection(e.target.value)}>
        {Object.entries(SECTIONS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={add}>+ Ajouter un élément</button>
        {items?.length === 0 && (
          <button className={btnGhost} onClick={importDefaults}>Charger le contenu actuel du site</button>
        )}
      </div>
      {!items && <p className="text-sm">Chargement…</p>}
      {items?.map((b) => (
        <BlockRow key={b.id} item={b} ctx={ctx} onChanged={load} />
      ))}
    </div>
  );
}

function BlockRow({ item, ctx, onChanged }: { item: Row<Block>; ctx: Ctx; onChanged: () => void }) {
  const [b, setB] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Block>(k: K, v: Block[K]) => setB((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    const { error } = await getBrowserClient()
      .from("content_blocks")
      .update({ title: b.title, body: b.body?.trim() || null, is_active: b.is_active, sort_order: b.sort_order })
      .eq("id", b.id);
    if (error) ctx.notify("Erreur : " + error.message, false);
    else {
      await ctx.publish();
      ctx.notify("Enregistré. Le site est mis à jour.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Supprimer « ${b.title} » définitivement ?`)) return;
    const { error } = await getBrowserClient().from("content_blocks").delete().eq("id", b.id);
    if (error) return ctx.notify("Erreur : " + error.message, false);
    await ctx.publish();
    onChanged();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ink/10 bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <input className={input} value={b.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Titre" />
        <input className={input} type="number" value={b.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} title="Ordre d'affichage" />
      </div>
      <textarea className={input} rows={2} value={b.body ?? ""} onChange={(e) => set("body", e.target.value)} placeholder="Texte (facultatif)" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={b.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          Visible sur le site
        </label>
        <button className={btn} onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button>
        <button className={btnGhost} onClick={remove} disabled={busy}>Supprimer</button>
      </div>
    </div>
  );
}
