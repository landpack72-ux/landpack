import { cookies } from "next/headers";
import { json, sameOrigin } from "@/lib/admin-server";
import { dropCustomerSession } from "@/lib/customer-server";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);

  const token = (await cookies()).get("lp_ct")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (token && url && anon) {
    await fetch(`${url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  await dropCustomerSession();
  return json({ ok: true });
}
