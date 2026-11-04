// Session administrateur CÔTÉ SERVEUR.
//
// Les jetons de connexion sont stockés dans des cookies HttpOnly : le JavaScript du
// navigateur (donc un éventuel code injecté) ne peut JAMAIS les lire. Le navigateur
// n'a plus rien dans le localStorage : toutes les actions de l'admin passent par les
// routes /api/admin/*, qui vérifient la session à chaque requête.

import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ACCESS = "lp_at";
const REFRESH = "lp_rt";

/** Client Supabase côté serveur. Avec un jeton, les règles RLS s'appliquent à CET utilisateur. */
export function supabaseFor(token?: string): SupabaseClient | null {
  if (!URL_ || !ANON) return null;
  return createClient(URL_, ANON, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

const cookieBase = {
  httpOnly: true, // illisible par le JavaScript de la page
  secure: process.env.NODE_ENV === "production", // HTTPS uniquement en ligne
  sameSite: "strict" as const, // jamais envoyé depuis un autre site
  path: "/",
};

export async function writeSession(access: string, refresh: string, expiresIn: number) {
  const jar = await cookies();
  jar.set(ACCESS, access, { ...cookieBase, maxAge: Math.max(60, expiresIn) });
  jar.set(REFRESH, refresh, { ...cookieBase, maxAge: 60 * 60 * 24 * 7 });
}

export async function dropSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export type AdminCtx = { db: SupabaseClient; email: string; token: string };

/** Renvoie le contexte admin si la session est valide ET que le compte est dans la table admins. */
export async function requireAdmin(): Promise<AdminCtx | null> {
  const anon = supabaseFor();
  if (!anon) return null;

  const jar = await cookies();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;

  async function refreshNow(): Promise<string | null> {
    if (!refresh || !anon) return null;
    const { data, error } = await anon.auth.refreshSession({ refresh_token: refresh });
    if (error || !data.session) return null;
    await writeSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
    return data.session.access_token;
  }

  if (!access) access = (await refreshNow()) ?? undefined;
  if (!access) {
    await dropSession();
    return null;
  }

  let db = supabaseFor(access)!;
  let user = (await db.auth.getUser(access)).data.user;
  if (!user) {
    // Jeton expiré ou révoqué : une seule tentative de renouvellement.
    const renewed = await refreshNow();
    if (!renewed) {
      await dropSession();
      return null;
    }
    access = renewed;
    db = supabaseFor(access)!;
    user = (await db.auth.getUser(access)).data.user;
    if (!user) return null;
  }

  const { data: isAdmin, error } = await db.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { db, email: user.email ?? "", token: access };
}

/** Protection CSRF : une requête qui modifie quelque chose doit venir de notre propre site. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [req.headers.get("x-forwarded-host"), req.headers.get("host"), new URL(req.url).host];
  return hosts.some((h) => h && h.split(",")[0].trim() === originHost);
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/* ---- Limitation des tentatives de connexion (en mémoire : suffisant contre un essai
        massif depuis une même adresse ; Supabase applique aussi ses propres limites). ---- */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "inconnue"
  );
}
export function tooManyAttempts(ip: string): boolean {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= MAX_FAILS;
}
export function recordFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW_MS) attempts.set(ip, { count: 1, first: Date.now() });
  else a.count += 1;
}
export function clearFailures(ip: string) {
  attempts.delete(ip);
}
