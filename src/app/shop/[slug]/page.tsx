import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, GitBranch, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DownloadButton from "@/components/DownloadButton";
import FavoriteButton from "@/components/FavoriteButton";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import CopyableId from "@/components/CopyableId";
import StarRating from "@/components/StarRating";
import ReviewsSection from "@/components/ReviewsSection";
import ReportButton from "@/components/ReportButton";
import type { App, Review } from "@/lib/types";

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // A bare 6-digit App ID landing on /shop/<code> (e.g. shared from the
  // "Copy App ID" button) redirects to the real slug instead of a 404.
  if (/^\d{6}$/.test(slug)) {
    const { data: byCode } = await supabase
      .from("apps")
      .select("slug")
      .eq("app_code", slug)
      .eq("status", "published")
      .single();

    if (!byCode) notFound();
    redirect(`/shop/${byCode.slug}`);
  }

  const { data: app } = await supabase
    .from("apps")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!app) notFound();

  const typedApp = {
    ...(app as App),
    platform_links: (app as App).platform_links ?? [],
    screenshots: (app as App).screenshots ?? [],
    default_platform: (app as App).default_platform ?? "desktop",
  };

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("app_id", typedApp.id)
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user
    ? (await supabase.rpc("is_admin", { uid: user.id })).data === true
    : false;

  // Every submission includes a source repo for review purposes; whether
  // it's shown here is the developer's own call (source_public).
  const showSource = !!typedApp.github_url && (typedApp.source_public || isAdmin);

  const lastUpdated = new Date(typedApp.updated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold">{typedApp.name}</h1>
              {isAdmin && (
                <Link
                  href={`/admin/${typedApp.id}/edit`}
                  className="glass-card aurora-border flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-text transition-transform hover:scale-105"
                >
                  <Pencil size={12} /> Edit
                </Link>
              )}
            </div>
            {typedApp.tagline && (
              <p className="mt-1 text-text-muted">{typedApp.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted">
              <span>v{typedApp.version}</span>
              {typedApp.size_label && <span>{typedApp.size_label}</span>}
              <span>{typedApp.downloads_count.toLocaleString()} downloads</span>
              {typedApp.rating_count > 0 && (
                <span className="flex items-center gap-1">
                  <StarRating value={typedApp.rating_avg} size={12} />
                  {typedApp.rating_avg.toFixed(1)} ({typedApp.rating_count})
                </span>
              )}
              {typedApp.categories?.name && <span>{typedApp.categories.name}</span>}
              <CopyableId id={typedApp.app_code} label="App ID" />
            </div>
          </div>
        </div>

        <p className="shrink-0 whitespace-nowrap font-mono text-xs text-text-muted sm:text-right">
          Last updated
          <br className="hidden sm:block" /> {lastUpdated}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <DownloadButton appId={typedApp.id} links={typedApp.platform_links} />
        <FavoriteButton appId={typedApp.id} />
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
        {showSource && (
          <a
            href={typedApp.github_url!}
            target="_blank"
            rel="noreferrer"
            className="glass-card aurora-border ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-transform hover:scale-[1.03]"
          >
            <GitBranch size={13} /> View Source
            {isAdmin && !typedApp.source_public && (
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] text-text-muted">
                hidden
              </span>
            )}
          </a>
        )}
      </div>

      <ScreenshotGallery
        screenshots={typedApp.screenshots}
        defaultPlatform={typedApp.default_platform}
        appName={typedApp.name}
      />

      {typedApp.description && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-lg font-semibold">About this app</h2>
          <p className="mt-3 whitespace-pre-line text-text-muted">
            {typedApp.description}
          </p>
        </div>
      )}

      <ReviewsSection
        appId={typedApp.id}
        slug={typedApp.slug}
        reviews={(reviews as Review[]) ?? []}
        ratingAvg={typedApp.rating_avg}
        ratingCount={typedApp.rating_count}
        currentUserId={user?.id ?? null}
      />

      <div className="mt-10 flex justify-center border-t border-border pt-6">
        <ReportButton appId={typedApp.id} />
      </div>
    </div>
  );
}
