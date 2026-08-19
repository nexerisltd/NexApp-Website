import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client for the separate NexAurasTM Supabase project.
 * Uses the service role key so it can read the `profiles` table (for
 * NexID lookups) regardless of that project's own RLS policies.
 *
 * NEVER import this from a Client Component — the service role key
 * must stay on the server.
 */
export function createNexAurasClient() {
  return createClient(
    process.env.NEXAURAS_SUPABASE_URL!,
    process.env.NEXAURAS_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Look up NexIDs for a batch of emails in one query. Returns a map of
 * email -> nex_id. Emails with no matching NexAuras profile are omitted.
 */
export async function getNexIdsByEmail(emails: string[]): Promise<Record<string, string>> {
  if (emails.length === 0) return {};

  const client = createNexAurasClient();
  const { data, error } = await client
    .from("profiles")
    .select("email, nex_id")
    .in("email", emails);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.email && row.nex_id) map[row.email] = row.nex_id;
  }
  return map;
}
