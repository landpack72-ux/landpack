// Petit « faux » client Supabase pour l'admin : il garde la même syntaxe
// (.from().select().eq()...) mais envoie la requête à /api/admin/db, où le serveur
// vérifie la session (cookie HttpOnly) avant d'interroger la base.

export type DbResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error: { message: string } | null;
  count: number | null;
};

type Filter = { column: string; value: unknown };
type Order = { column: string; ascending: boolean };

class Query implements PromiseLike<DbResult> {
  private body: Record<string, unknown>;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private max?: number;

  constructor(table: string) {
    this.body = { table };
  }

  select(columns = "*", opts?: { count?: "exact"; head?: boolean }) {
    this.body = { ...this.body, action: "select", select: columns, count: opts?.count, head: opts?.head };
    return this;
  }
  insert(values: unknown) {
    this.body = { ...this.body, action: "insert", values };
    return this;
  }
  update(values: unknown) {
    this.body = { ...this.body, action: "update", values };
    return this;
  }
  upsert(values: unknown, opts?: { onConflict?: string }) {
    this.body = { ...this.body, action: "upsert", values, onConflict: opts?.onConflict };
    return this;
  }
  delete() {
    this.body = { ...this.body, action: "delete" };
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }
  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending !== false });
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }

  then<R1 = DbResult, R2 = never>(
    onfulfilled?: ((value: DbResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private async run(): Promise<DbResult> {
    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...this.body, filters: this.filters, order: this.orders, limit: this.max }),
      });
      if (res.status === 401) {
        window.dispatchEvent(new Event("lp-session-expired"));
        return { data: null, error: { message: "Session expirée, reconnectez-vous." }, count: null };
      }
      const j = await res.json();
      return { data: j.data ?? null, error: j.error ?? (res.ok ? null : { message: "Erreur" }), count: j.count ?? null };
    } catch {
      return { data: null, error: { message: "Connexion impossible." }, count: null };
    }
  }
}

export const adminDb = { from: (table: string) => new Query(table) };

/** Envoie une image WebP au serveur, qui la range dans le stockage. Renvoie son adresse publique. */
export async function uploadToServer(
  blob: Blob,
  folder: string,
  variant?: { of: string; size: "md" | "sm" },
): Promise<string> {
  const form = new FormData();
  form.append("file", new File([blob], "image.webp", { type: "image/webp" }));
  form.append("folder", folder);
  if (variant) {
    form.append("variantOf", variant.of);
    form.append("variant", variant.size);
  }
  const res = await fetch("/api/admin/upload", { method: "POST", credentials: "same-origin", body: form });
  if (res.status === 401) window.dispatchEvent(new Event("lp-session-expired"));
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.url) throw new Error(j.error ?? "Échec de l'envoi de la photo.");
  return j.url as string;
}
