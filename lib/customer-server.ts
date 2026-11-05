// Comptes CLIENTS, côté serveur. Même principe que l'admin : jetons dans des cookies HttpOnly,
// jamais dans le navigateur. Un client se connecte avec son NUMÉRO DE TÉLÉPHONE et un mot de passe :
// aucune adresse e-mail n'est demandée ni conservée (Supabase a besoin d'un identifiant de forme
// « e-mail » : on en fabrique un à partir du numéro, il ne sert qu'à cela et n'est jamais utilisé).

import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseFor } from "./admin-server";
import { makeLimiter } from "./rate-limit";
export { passwordProblem } from "./password-rules";

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

// ------------------------------- identité : e-mail + mot de passe -------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Adresse e-mail propre (minuscules, sans espaces) ou null si elle n'a pas l'air valable. */
export function cleanEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const e = v.trim().toLowerCase();
  return e.length <= 254 && EMAIL_RE.test(e) ? e : null;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
export function profileOf(user: User) {
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;
  return { first_name: str(m.first_name), last_name: str(m.last_name), phone: str(m.phone), address: str(m.address), email: user.email ?? "" };
}

/** Adresse du site d'où vient la demande (pour les liens des e-mails de confirmation et de réinitialisation). */
export function originOf(req: Request): string | null {
  const o = req.headers.get("origin");
  try {
    return o ? new URL(o).origin : null;
  } catch {
    return null;
  }
}

/** Traduit une erreur de Supabase Auth en message clair pour le client, avec le code HTTP adapté. */
export function authFailure(error: { code?: string; message: string; status?: number }): { status: number; message: string; code: string } {
  const code = error.code ?? "";
  const m = error.message.toLowerCase();
  if (code === "user_already_exists" || code === "email_exists" || m.includes("already registered") || m.includes("already been registered"))
    return { status: 409, code: "user_already_exists", message: "Un compte existe déjà avec cet e-mail. Connectez-vous, ou utilisez « Mot de passe oublié »." };
  if (code === "signup_disabled" || m.includes("signups not allowed") || m.includes("signup is disabled") || m.includes("signups are disabled"))
    return { status: 403, code: "signup_disabled", message: "La création de compte est momentanément indisponible. Contactez-nous." };
  if (code === "weak_password" || m.includes("password should") || m.includes("weak password"))
    return { status: 400, code: "weak_password", message: "Ce mot de passe est trop faible ou trop courant. Choisissez-en un plus long, avec lettres et chiffres." };
  if (code === "email_address_invalid" || code === "validation_failed" || m.includes("invalid format") || m.includes("unable to validate email") || m.includes("is invalid"))
    return { status: 400, code: "email_address_invalid", message: "Cette adresse e-mail n'est pas acceptée. Vérifiez-la ou utilisez-en une autre." };
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429 || m.includes("rate limit"))
    return { status: 429, code: "rate_limited", message: "Trop de demandes pour le moment. Réessayez dans quelques minutes." };
  if (code === "email_address_not_authorized" || m.includes("sending confirmation") || m.includes("error sending") || m.includes("smtp") || code === "unexpected_failure")
    return { status: 503, code: "email_not_sent", message: "L'e-mail de confirmation n'a pas pu être envoyé. Réessayez plus tard ou contactez-nous." };
  if (code === "email_not_confirmed" || m.includes("email not confirmed"))
    return { status: 403, code: "email_not_confirmed", message: "Votre adresse e-mail n'est pas encore confirmée. Ouvrez l'e-mail que nous vous avons envoyé." };
  if (m.includes("aborted") || m.includes("timeout") || m.includes("timed out") || m.includes("fetch failed") || m.includes("retryable"))
    return { status: 504, code: "timeout", message: "Le service met trop de temps à répondre (souvent l'envoi de l'e-mail). Patientez une minute et réessayez ; si le problème continue, contactez-nous." };
  if (code === "invalid_credentials" || m.includes("invalid login") || m.includes("invalid credentials"))
    return { status: 401, code: "invalid_credentials", message: "E-mail ou mot de passe incorrect." };
  return { status: 500, code: code || "unknown", message: "Une erreur est survenue. Réessayez dans un instant ou contactez-nous." };
}

export const loginLimiter = makeLimiter(10, 15 * 60 * 1000); // par adresse IP
export const loginEmailLimiter = makeLimiter(6, 15 * 60 * 1000); // par e-mail (contre l'essai de mots de passe)
export const registerLimiter = makeLimiter(8, 60 * 60 * 1000);
export const mailLimiter = makeLimiter(4, 60 * 60 * 1000); // e-mails envoyés (oubli, renvoi) : par e-mail ou IP
export const orderLimiter = makeLimiter(20, 60 * 60 * 1000);
