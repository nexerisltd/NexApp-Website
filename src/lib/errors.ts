// Turns any thrown/returned error into a short, generic, user-safe message
// — never a raw Postgres/Supabase error, stack trace, or file path — while
// still logging the full detail server-side (visible in Vercel's function
// logs) so real debugging isn't lost.
export function safeError(context: string, error: unknown): string {
  console.error(`[${context}]`, error);
  return "Something went wrong on our end. Please try again in a moment.";
}
