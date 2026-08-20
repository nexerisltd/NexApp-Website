import type { createClient } from "@/lib/supabase/server";

// Centralized, configurable rate limiting for server actions. Backed by a
// Postgres table (see check_rate_limit() in supabase/schema.sql) instead of
// in-memory state, since Vercel's serverless functions don't share memory
// between invocations — an in-memory counter would silently do nothing.
//
// Thresholds are passed in per call site (not hardcoded here) so each
// endpoint can set its own limit appropriate to its risk:
//   - moderate limits for authenticated user actions (submit, review, report)
//   - looser limits for admin actions (still capped, to blunt a compromised
//     admin session or runaway script)
// This app has no password-based auth routes (login/signup are Google
// OAuth only, handled entirely by Supabase/Google — see note in
// login/signup pages), so there's no local brute-force surface to add
// per-IP + per-account exponential backoff to; Supabase's own OAuth/token
// endpoints already rate-limit that.
export async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  options: { maxHits: number; windowSeconds: number }
): Promise<{ allowed: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max_hits: options.maxHits,
    p_window_seconds: options.windowSeconds,
  });

  if (error) {
    // Fail open on infra errors (don't let a rate-limiter outage take the
    // whole app down) but log it — a persistent failure here is itself
    // worth knowing about.
    console.error("[rateLimit] check_rate_limit RPC failed:", error.message);
    return { allowed: true };
  }

  if (!data) {
    return {
      allowed: false,
      error: "Too many requests — please wait a bit and try again.",
    };
  }

  return { allowed: true };
}
