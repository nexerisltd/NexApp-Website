import Link from "next/link";
import {
  CheckSquare,
  Clapperboard,
  Wrench,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Coffee,
  Code2,
} from "lucide-react";

const CATEGORY_STYLE: Record<string, { icon: typeof CheckSquare; gradient: string }> = {
  productivity: { icon: CheckSquare, gradient: "linear-gradient(135deg, #3159e8, #4d76ff)" },
  entertainment: { icon: Clapperboard, gradient: "linear-gradient(135deg, #e6437a, #f59e0b)" },
  utilities: { icon: Wrench, gradient: "linear-gradient(135deg, #12b8a6, #4ade95)" },
  games: { icon: Gamepad2, gradient: "linear-gradient(135deg, #e08a2b, #e6437a)" },
  education: { icon: GraduationCap, gradient: "linear-gradient(135deg, #2b8fe0, #12b8a6)" },
  business: { icon: Briefcase, gradient: "linear-gradient(135deg, #c2410c, #e08a2b)" },
  lifestyle: { icon: Coffee, gradient: "linear-gradient(135deg, #a855f7, #e6437a)" },
  "developer-tools": { icon: Code2, gradient: "linear-gradient(135deg, #7c3aed, #4d76ff)" },
};
const FALLBACK = Object.values(CATEGORY_STYLE);

export default function TopCategoriesGrid({
  categories,
}: {
  categories: { id: string; name: string; slug: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((cat, i) => {
        const style = CATEGORY_STYLE[cat.slug] ?? FALLBACK[i % FALLBACK.length];
        const Icon = style.icon;
        return (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-transform hover:-translate-y-1"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: style.gradient }}
            >
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{cat.name}</span>
              <span className="block font-mono text-xs text-text-muted">
                {cat.count} App{cat.count === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
