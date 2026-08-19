import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Unlike lib/supabase/server.ts, this never touches cookies(), so pages that
// only need published/public data can use it and still be statically
// rendered / ISR-cached. Never use this for anything that depends on the
// signed-in user — it has no session.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
