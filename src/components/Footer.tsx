import TypewriterCredit from "@/components/TypewriterCredit";

export default function Footer() {
  return (
    <footer className="glass border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-4 text-xs text-text-muted sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} NexAuras</p>
        <TypewriterCredit className="text-text-muted" />
      </div>
    </footer>
  );
}
