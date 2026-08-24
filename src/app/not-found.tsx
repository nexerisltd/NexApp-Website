import Link from "next/link";
import { Compass } from "lucide-react";

// Next.js tries to statically export the auto-generated /_not-found route
// by default. Our root layout's Sidebar reads cookies() on every request
// (for per-user personalization), which forces the whole tree dynamic —
// that's incompatible with a static export attempt and broke the build.
// Explicitly forcing this page dynamic resolves the conflict.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <Compass size={40} className="text-text-muted" />
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent"
      >
        Back to home
      </Link>
    </div>
  );
}
