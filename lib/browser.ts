// Client Supabase utilisé dans le navigateur par les VISITEURS (envoi de demandes).
// Il n'ouvre aucune session et n'écrit RIEN dans le localStorage ni les cookies.
// Il utilise uniquement la clé « anon » publique : la sécurité vient des règles RLS.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
