import Link from "next/link";
import {
  Compass,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  CheckSquare,
  Clapperboard,
  Wrench,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Coffee,
  Code2,
  Boxes,
} from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import SidebarInstallCard from "@/components/SidebarInstallCard";

const NAV_LINKS = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/shop?sort=top", label: "Top Charts", icon: TrendingUp },
  { href: "/shop?sort=new", label: "New Releases", icon: Sparkles },
  { href: "/shop?sort=top", label: "Editor's Choice", icon: Award },
  { href: "/favorites", label: "Collections", icon: Layers },
];

// A per-category icon + color, matched by name where we recognize it and
// cycling through a fallback set otherwise — categories don't store their
// own icon/color in the DB.
const CATEGORY_STYLE: Record<string, { icon: typeof CheckSquare; color: string }> = {
  productivity: { icon: CheckSquare, color: "#3159e8" },
  entertainment: { icon: Clapperboard, color: "#e6437a" },
  utilities: { icon: Wrench, color: "#12b8a6" },
  games: { icon: Gamepad2, color: "#e08a2b" },
  education: { icon: GraduationCap, color: "#2b8fe0" },
  business: { icon: Briefcase, color: "#c2410c" },
  lifestyle: { icon: Coffee, color: "#a855f7" },
  "developer-tools": { icon: Code2, color: "#7c3aed" },
};
const FALLBACK_STYLES = Object.values(CATEGORY_STYLE);

export default async function Sidebar() {
  const supabase = createPublicClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categoryRows = (categories ?? []) as { id: string; name: string; slug: string }[];

  return (
    <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-4 lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <p className="mb-2 mt-6 px-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Categories
      </p>
      <nav className="flex flex-1 flex-col gap-0.5">
        {categoryRows.map((cat, i) => {
          const style = CATEGORY_STYLE[cat.slug] ?? FALLBACK_STYLES[i % FALLBACK_STYLES.length];
          const Icon = style.icon;
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <Icon size={15} style={{ color: style.color }} />
              {cat.name}
            </Link>
          );
        })}
        {categoryRows.length === 0 && (
          <Link
            href="/shop"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <Boxes size={15} />
            Browse all
          </Link>
        )}
      </nav>

      <SidebarInstallCard />
    </aside>
  );
}
