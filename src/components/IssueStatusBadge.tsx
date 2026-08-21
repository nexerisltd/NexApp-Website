"use client";

import { useEffect, useState } from "react";
import { Clock, FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { IssueRequestStatus } from "@/lib/types";

const STYLES: Record<
  IssueRequestStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: { label: "Pending", icon: Clock, className: "bg-surface-2 text-text-muted" },
  testing: { label: "Testing", icon: FlaskConical, className: "bg-accent/10 text-accent" },
  granted: { label: "Granted & applied", icon: CheckCircle2, className: "bg-success/10 text-success" },
  denied: { label: "Denied & dismissed", icon: XCircle, className: "bg-danger/10 text-danger" },
};

export default function IssueStatusBadge({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: IssueRequestStatus;
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`issue-request-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "issue_requests", filter: `id=eq.${id}` },
        (payload) => {
          const next = (payload.new as { status?: IssueRequestStatus }).status;
          if (next) setStatus(next);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const { label, icon: Icon, className } = STYLES[status];

  return (
    <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      <Icon size={11} /> {label}
    </span>
  );
}
