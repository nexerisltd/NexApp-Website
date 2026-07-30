import { notFound } from "next/navigation";
import { LayoutGrid, GitBranch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DownloadButton from "@/components/DownloadButton";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import CopyableId from "@/components/CopyableId";
import type { App } from "@/lib/types";

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("apps")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!app) notFound();

  const typedApp = { ...(app as App), platform_links: (app as App).platform_links ?? [] };

  const { data: source } = await supabase
    .from("sources")
    .select("github_url")
    .eq("app_id", typedApp.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-text-muted overflow-hidden">
          {typedApp.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typedApp.icon_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <LayoutGrid size={28} />
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">{typedApp.name}</h1>
          {typedApp.tagline && (
            <p className="mt-1 text-text-muted">{typedApp.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted">
            <span>v{typedApp.version}</span>
            {typedApp.size_label && <span>{typedApp.size_label}</span>}
            <span>{typedApp.downloads_count.toLocaleString()} downloads</span>
            {typedApp.categories?.name && <span>{typedApp.categories.name}</span>}
            <CopyableId id={typedApp.app_code} label="App ID" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <DownloadButton appId={typedApp.id} links={typedApp.platform_links} />
        <div className="flex flex-wrap items-center gap-2 text-text-muted">
          {typedApp.platform_links.map((link) => (
            <span
              key={link.label}
              className="glass-card rounded-full px-3 py-1 text-xs font-mono"
            >
              {link.label}
            </span>
          ))}
        </div>
        {source?.github_url && (
          <a
            href={source.github_url}
            target="_blank"
            rel="noreferrer"
            className="glass-card aurora-border ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-transform hover:scale-[1.03]"
          >
            <GitBranch size={13} /> View Source
          </a>
        )}
      </div>

      <ScreenshotGallery screenshots={typedApp.screenshots} appName={typedApp.name} />

      {typedApp.description && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-lg font-semibold">About this app</h2>
          <p className="mt-3 whitespace-pre-line text-text-muted">
            {typedApp.description}
          </p>
        </div>
      )}
    </div>
  );
}
