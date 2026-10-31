// Envoi d'une demande de visiteur vers la table « leads » de Supabase.
// Sécurité : la base n'accepte que l'ajout (règle RLS « leads envoi public »),
// les visiteurs ne peuvent rien lire. Seuls les admins voient les demandes.

import { getBrowserClient } from "./browser";

export type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  /** Champ piège invisible : rempli uniquement par des robots. */
  trap?: string;
};

export type LeadResult = "ok" | "error" | "wait";

const WAIT_MS = 30_000;

function clean(value: string | undefined, max: number): string | null {
  const v = (value ?? "").trim().slice(0, max);
  return v || null;
}

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  // Un robot a rempli le champ invisible : on fait semblant que tout va bien.
  if (input.trap) return "ok";

  // Évite les doubles envois (clic répété) : une demande toutes les 30 secondes.
  try {
    const last = Number(localStorage.getItem("lp_last_lead") ?? 0);
    if (Date.now() - last < WAIT_MS) return "wait";
  } catch {
    /* stockage indisponible : on continue */
  }

  try {
    const { error } = await getBrowserClient().from("leads").insert({
      name: clean(input.name, 120),
      email: clean(input.email, 254),
      phone: clean(input.phone, 40),
      message: clean(input.message, 4000),
      source: input.source.slice(0, 80),
    });
    if (error) return "error";
  } catch {
    return "error";
  }

  try {
    localStorage.setItem("lp_last_lead", String(Date.now()));
  } catch {
    /* ignoré */
  }
  return "ok";
}
