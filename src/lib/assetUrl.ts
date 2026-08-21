// Uploads now happen client-side directly to Supabase Storage (for real
// upload progress — see src/lib/uploadClient.ts), so server actions only
// ever receive the resulting public URL through a hidden field, not the
// file itself. This guards against a tampered hidden field pointing
// somewhere else entirely: only accept URLs that are actually public
// objects in our own app-assets bucket.
export function isTrustedAssetUrl(url: string | null): url is string {
  if (!url) return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  return url.startsWith(`${base}/storage/v1/object/public/app-assets/`);
}
