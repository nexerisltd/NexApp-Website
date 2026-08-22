import type { createClient } from "@/lib/supabase/server";

const PRIVATE_DOC_BUCKET = "dev-verification-docs";

// The dev-verification-docs bucket is private — this is the only way to
// ever view a document in it. The signed URL expires quickly (5 minutes)
// and storage RLS still requires the caller to be the doc's owner or an
// admin, so this never leaks a document to someone who shouldn't see it.
export async function getSignedDevDocUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
  expiresInSeconds = 300
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(PRIVATE_DOC_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
