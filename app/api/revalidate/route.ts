// Appelée par l'admin après chaque enregistrement : elle vérifie que la personne
// est bien admin, puis force le site à se mettre à jour.

import { createClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const client = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("is_admin");
  if (error || data !== true) {
    return Response.json({ ok: false }, { status: 403 });
  }

  revalidateTag("landpack", { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
