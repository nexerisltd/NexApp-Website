import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; pct: number }
  | { status: "done" }
  | { status: "error"; message: string };

export default function UploadProgress({ state }: { state: UploadState }) {
  if (state.status === "idle") return null;

  return (
    <div className="flex items-center gap-2.5">
      {state.status === "uploading" && (
        <>
          <div className="liquid-progress-track w-full max-w-[160px]">
            <div
              className="liquid-progress-fill"
              style={{ width: `${state.pct}%` }}
            />
          </div>
          <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-text-muted">
            <Loader2 size={11} className="animate-spin" />
            {state.pct}%
          </span>
        </>
      )}
      {state.status === "done" && (
        <span className="flex items-center gap-1 text-[11px] text-success">
          <CheckCircle2 size={12} /> Uploaded
        </span>
      )}
      {state.status === "error" && (
        <span className="flex items-center gap-1 text-[11px] text-danger">
          <AlertCircle size={12} /> {state.message}
        </span>
      )}
    </div>
  );
}
