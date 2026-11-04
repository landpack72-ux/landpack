import { json, sameOrigin } from "@/lib/admin-server";
import { requireCustomer } from "@/lib/customer-server";
import { clean, cleanPhone } from "@/lib/lead-clean";

// Met à jour le prénom, le nom et l'adresse du client connecté (le numéro, lui, ne change pas).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  const c = await requireCustomer();
  if (!c) return json({ error: "Session expirée." }, 401);

  const b = await req.json().catch(() => null);
  const first = clean(b?.first_name, 80);
  const last = clean(b?.last_name, 80);
  if (!first || !last) return json({ error: "Indiquez votre prénom et votre nom." }, 400);

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${c.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { first_name: first, last_name: last, phone: cleanPhone(b?.phone) ?? "", address: clean(b?.address, 300) ?? "" } }),
  }).catch(() => null);

  if (!res || !res.ok) return json({ error: "L'enregistrement a échoué. Réessayez." }, 400);
  return json({ ok: true });
}
