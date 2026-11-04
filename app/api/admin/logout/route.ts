import { cookies } from "next/headers";
import { dropSession, json, sameOrigin } from "@/lib/admin-server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  // On révoque aussi la session côté Supabase (pas seulement le cookie du navigateur).
  const token = (await cookies()).get("lp_at")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (token && url && anon) {
    await fetch(`${url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  await dropSession();
  return json({ ok: true });
}
