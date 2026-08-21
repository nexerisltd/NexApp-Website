import Link from "next/link";
import TypewriterCredit from "@/components/TypewriterCredit";

export default function Footer() {
  return (
    <footer className="glass border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-4 text-xs text-text-muted sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} NexAuras</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-text">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-text">
            Terms of Service
          </Link>
        </div>
        <TypewriterCredit className="text-text-muted" />
      </div>
    </footer>
  );
}
