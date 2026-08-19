import { createClient } from "@/lib/supabase/server";
import { DownloadsTimeSeries, PlatformBreakdown } from "@/components/AnalyticsCharts";
import type { App } from "@/lib/types";

const DAYS = 30;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const [{ data: recentDownloads }, { data: apps }, { data: totalsRow }] = await Promise.all([
    supabase
      .from("downloads")
      .select("app_id, platform_label, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("apps")
      .select("id, name, downloads_count")
      .order("downloads_count", { ascending: false })
      .limit(10),
    supabase.rpc("total_downloads_count").maybeSingle(),
  ]);

  const rows = recentDownloads ?? [];

  // Daily time series, zero-filled so gaps show as 0 instead of skipping days.
  const dailyCounts = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    dailyCounts.set(dayKey(d), 0);
  }
  for (const row of rows) {
    const key = dayKey(new Date(row.created_at));
    if (dailyCounts.has(key)) {
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    }
  }
  const timeSeries = Array.from(dailyCounts.entries()).map(([date, downloads]) => ({
    date: date.slice(5), // MM-DD
    downloads,
  }));

  // Platform breakdown across the same window.
  const platformCounts = new Map<string, number>();
  for (const row of rows) {
    const label = row.platform_label ?? "Unknown";
    platformCounts.set(label, (platformCounts.get(label) ?? 0) + 1);
  }
  const platformData = Array.from(platformCounts.entries())
    .map(([platform, downloads]) => ({ platform, downloads }))
    .sort((a, b) => b.downloads - a.downloads);

  const last7 = rows.filter(
    (r) => new Date(r.created_at) >= new Date(Date.now() - 7 * 86400000)
  ).length;

  const allTimeTotal = (totalsRow as { total: number } | null)?.total ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-text-muted">
        Download activity across every app.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-mono text-text-muted">All-time downloads</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {allTimeTotal.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-mono text-text-muted">Last 7 days</p>
          <p className="mt-1 font-display text-2xl font-bold">{last7.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-mono text-text-muted">Last {DAYS} days</p>
          <p className="mt-1 font-display text-2xl font-bold">{rows.length.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl p-5">
        <h2 className="font-display text-sm font-semibold">
          Downloads per day (last {DAYS} days)
        </h2>
        <div className="mt-4">
          <DownloadsTimeSeries data={timeSeries} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display text-sm font-semibold">
            Platform breakdown (last {DAYS} days)
          </h2>
          <div className="mt-4">
            {platformData.length > 0 ? (
              <PlatformBreakdown data={platformData} />
            ) : (
              <p className="py-10 text-center text-sm text-text-muted">
                No downloads logged yet in this window.
              </p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display text-sm font-semibold">Top apps (all-time)</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {(apps as App[] | null)?.map((app, i) => (
              <div key={app.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">{i + 1}.</span>
                  {app.name}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {app.downloads_count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
