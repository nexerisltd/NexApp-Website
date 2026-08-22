import Link from "next/link";
import { ShieldEllipsis, Globe2 } from "lucide-react";

export default function SeniorAdminHomePage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldEllipsis size={20} className="text-accent" />
        <h1 className="font-display text-2xl font-bold">Senior Admin</h1>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Extra, more sensitive controls — more tools land here over time.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/senior/search-console"
          className="glass-card aurora-border flex items-start gap-3 rounded-2xl p-5 transition-transform hover:scale-[1.01]"
        >
          <Globe2 size={20} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="font-medium">Google Search Console verification</p>
            <p className="mt-1 text-xs text-text-muted">
              Verify domain ownership via DNS or URL prefix.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
