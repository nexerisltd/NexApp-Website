import Link from "next/link";
import { ArrowLeft, Globe2, Tag, FileCode, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { saveSearchConsoleSettings } from "@/app/admin/senior/search-console/actions";
import GoogleHtmlFileInput from "@/components/GoogleHtmlFileInput";
import FeedbackToast from "@/components/FeedbackToast";
import SubmitButton from "@/components/SubmitButton";
import { UploadTrackerProvider } from "@/lib/uploadTracker";

export default async function SearchConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_verification_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  return (
    <div>
      <FeedbackToast
        saved={saved === "1"}
        error={error}
        successMessage="Saved"
        redirectTo="/admin/senior/search-console"
      />
      <Link
        href="/admin/senior"
        className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
      >
        <ArrowLeft size={12} /> Senior Admin
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <Globe2 size={20} className="text-accent" />
        <h1 className="font-display text-2xl font-bold">Search Console verification</h1>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Pick whichever method Google Search Console asked for — you only need one.
      </p>

      <UploadTrackerProvider>
        <form action={saveSearchConsoleSettings} className="mt-8 flex flex-col gap-8">
          <section className="glass-card aurora-border rounded-2xl p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold">
              <FileCode size={14} /> DNS record — TXT
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Add this record with your domain registrar (Cloudflare, Namecheap, etc.) —
              we can&apos;t do this step for you since it&apos;s outside our
              infrastructure. This is just a place to keep the values on hand.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                name="dns_txt_host"
                placeholder="Host, e.g. @ or nexapp.com"
                defaultValue={settings?.dns_txt_host ?? ""}
                className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              <input
                name="dns_txt_value"
                placeholder="TXT value Google gave you"
                defaultValue={settings?.dns_txt_value ?? ""}
                className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </section>

          <section className="glass-card aurora-border rounded-2xl p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold">
              <FileCode size={14} /> DNS record — CNAME
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Same as above — added manually at your registrar, kept here for reference.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                name="dns_cname_host"
                placeholder="Host Google gave you"
                defaultValue={settings?.dns_cname_host ?? ""}
                className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              <input
                name="dns_cname_value"
                placeholder="Points to (value)"
                defaultValue={settings?.dns_cname_value ?? ""}
                className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </section>

          <section className="glass-card aurora-border rounded-2xl p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold">
              <Copy size={14} /> URL prefix — HTML file
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Upload the exact <code>.html</code> file Google Search Console gave you to
              download — this sets everything up automatically, live at the domain root.
            </p>
            <div className="mt-3">
              <GoogleHtmlFileInput
                existingFilename={settings?.google_html_verification_filename}
                existingContent={settings?.google_html_verification_content}
              />
            </div>
          </section>

          <section className="glass-card aurora-border rounded-2xl p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold">
              <Tag size={14} /> URL prefix — HTML tag
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Paste just the <code>content</code> value from the meta tag Google shows you
              — it gets rendered into every page&apos;s <code>&lt;head&gt;</code>{" "}
              automatically.
            </p>
            <input
              name="google_site_verification_meta"
              placeholder="content value only, not the full <meta> tag"
              defaultValue={settings?.google_site_verification_meta ?? ""}
              className="mt-3 aurora-border glass-card w-full max-w-md rounded-xl px-4 py-2.5 text-sm outline-none"
            />
          </section>

          <SubmitButton>Save verification settings</SubmitButton>
        </form>
      </UploadTrackerProvider>
    </div>
  );
}
