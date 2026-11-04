// Comptes CLIENTS, côté serveur. Même principe que l'admin : jetons dans des cookies HttpOnly,
// jamais dans le navigateur. Un client se connecte avec son NUMÉRO DE TÉLÉPHONE et un mot de passe :
// aucune adresse e-mail n'est demandée ni conservée (Supabase a besoin d'un identifiant de forme
// « e-mail » : on en fabrique un à partir du numéro, il ne sert qu'à cela et n'est jamais utilisé).

import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseFor } from "./admin-server";
import { makeLimiter } from "./rate-limit";

const ACCESS = "lp_ct";
const REFRESH = "lp_cr";

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function writeCustomerSession(access: string, refresh: string, expiresIn: number) {
  const jar = await cookies();
  jar.set(ACCESS, access, { ...cookieBase, maxAge: Math.max(60, expiresIn) });
  jar.set(REFRESH, refresh, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });
}

export async function dropCustomerSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export type CustomerCtx = { db: SupabaseClient; user: User; token: string };

export async function requireCustomer(): Promise<CustomerCtx | null> {
  const anon = supabaseFor();
  if (!anon) return null;

  const jar = await cookies();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;

  async function refreshNow(): Promise<string | null> {
    if (!refresh || !anon) return null;
    const { data, error } = await anon.auth.refreshSession({ refresh_token: refresh });
    if (error || !data.session) return null;
    await writeCustomerSession(data.session.access_token, data.session.refresh_token, data.session.expires_in);
    return data.session.access_token;
  }

  if (!access) access = (await refreshNow()) ?? undefined;
  if (!access) {
    await dropCustomerSession();
    return null;
  }

  let db = supabaseFor(access)!;
  let user = (await db.auth.getUser(access)).data.user;
  if (!user) {
    const renewed = await refreshNow();
    if (!renewed) {
      await dropCustomerSession();
      return null;
    }
    access = renewed;
    db = supabaseFor(access)!;
    user = (await db.auth.getUser(access)).data.user;
    if (!user) return null;
  }
  return { db, user, token: access };
}

/** « 06 12 34 56 78 », « +212 6 12 34 56 78 » ou « 00212612345678 » donnent le même identifiant. */
export function phoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("0")) d = "212" + d.slice(1);
  return d;
}
export const validDigits = (d: string) => /^\d{9,15}$/.test(d);
export const emailFor = (digits: string) => `c${digits}@comptes.landpack.ma`;

const str = (v: unknown) => (typeof v === "string" ? v : "");
export function profileOf(user: User) {
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;
  return { first_name: str(m.first_name), last_name: str(m.last_name), phone: str(m.phone), address: str(m.address) };
}

export const loginLimiter = makeLimiter(10, 15 * 60 * 1000);
export const registerLimiter = makeLimiter(5, 60 * 60 * 1000);
export const orderLimiter = makeLimiter(20, 60 * 60 * 1000);
