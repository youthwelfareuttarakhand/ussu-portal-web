"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdmissionStatus } from "@/types/api";

export function AdmissionReviewActions({ admissionId, status }: { admissionId: string; status: AdmissionStatus }) {
  const router = useRouter();
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "APPROVED" || status === "REJECTED") return null;

  async function setStatus(next: "APPROVED" | "REJECTED") {
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/admissions/${admissionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update this application. Please try again.");
    } finally {
      setLoading(false);
      setConfirmingApprove(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">Review</p>
      <p className="mt-1 text-sm text-muted">
        Approve issues a UKSSU ID and cannot be undone here. Confirm the applicant has cleared the written and physical
        test before approving.
      </p>

      {error && <p className="mt-3 text-sm font-semibold text-accent">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-3">
        {confirmingApprove ? (
          <>
            <span className="inline-flex items-center text-sm font-semibold text-ink">Confirm approve?</span>
            <button
              type="button"
              onClick={() => setStatus("APPROVED")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              <Check size={14} />
              {loading ? "Approving…" : "Confirm Approve"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingApprove(false)}
              disabled={loading}
              className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:bg-surface"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirmingApprove(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              <Check size={14} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setStatus("REJECTED")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/5 disabled:opacity-60"
            >
              <X size={14} />
              {loading ? "Rejecting…" : "Reject"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
