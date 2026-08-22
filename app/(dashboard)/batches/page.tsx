"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Pencil, Plus, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import type { AdmissionBatch } from "@/types/api";

export default function BatchesPage() {
  const [batches, setBatches] = useState<AdmissionBatch[] | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [examDate, setExamDate] = useState("");
  const [reportingTime, setReportingTime] = useState("");
  const [examCentreName, setExamCentreName] = useState("");
  const [examCentreAddress, setExamCentreAddress] = useState("");

  function reload() {
    apiFetch<AdmissionBatch[]>("/admissions/batches")
      .then(setBatches)
      .catch(() => setBatches([]));
  }

  useEffect(reload, []);

  async function startNewBatch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/admissions/batches", { method: "POST", body: JSON.stringify({ label }) });
      setLabel("");
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the new batch. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function closeAdmissions(id: string) {
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/admissions/batches/${id}/close`, { method: "PATCH" });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not close admissions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(batch: AdmissionBatch) {
    setEditingId(batch.id);
    setExamDate(batch.examDate ? batch.examDate.slice(0, 10) : "");
    setReportingTime(batch.reportingTime ?? "");
    setExamCentreName(batch.examCentreName ?? "");
    setExamCentreAddress(batch.examCentreAddress ?? "");
  }

  async function saveExamDetails(id: string, e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/admissions/batches/${id}/exam-details`, {
        method: "PATCH",
        body: JSON.stringify({
          examDate: examDate ? new Date(examDate).toISOString() : undefined,
          reportingTime: reportingTime || undefined,
          examCentreName: examCentreName || undefined,
          examCentreAddress: examCentreAddress || undefined,
        }),
      });
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save exam details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const active = batches?.find((b) => b.isActive);

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Admission Batches</h2>
      <p className="mt-1 max-w-xl text-sm text-muted">
        Only one batch is ever open for new admissions at a time. Starting a new batch closes the current one
        immediately — applicants who haven&rsquo;t finished their admission form will see whatever batch is active
        when they next open it.
      </p>

      <Reveal className="mt-4 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-primary via-primary to-accent" />
        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-muted">Currently active</p>
            <p className="mt-1 font-display text-2xl tracking-wide text-ink">{active ? active.label : "None open"}</p>
          </div>
          {active && (
            <button
              type="button"
              onClick={() => closeAdmissions(active.id)}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-2 text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/5 disabled:opacity-60"
            >
              <X size={14} />
              Close Admissions
            </button>
          )}
        </div>
      </Reveal>

      <form onSubmit={startNewBatch} className="mt-6 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <label htmlFor="batch-label" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            New batch label
          </label>
          <input
            id="batch-label"
            type="text"
            required
            placeholder="e.g. 2027-2028"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <Plus size={16} />
          {loading ? "Starting…" : "Start New Batch"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-accent">{error}</p>}

      <h3 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted">History</h3>
      <RevealGroup className="mt-3 space-y-2">
        {batches?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No batches yet
          </p>
        )}
        {batches?.map((batch, i) => (
          <RevealItem key={batch.id} delayMs={i * 40}>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarRange size={16} />
                  </span>
                  <span className="text-sm font-semibold text-ink">{batch.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-faint">{new Date(batch.startedAt).toLocaleDateString()}</span>
                  {batch.isActive && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Active</span>
                  )}
                  <button
                    type="button"
                    onClick={() => (editingId === batch.id ? setEditingId(null) : startEditing(batch))}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Pencil size={13} />
                    Exam Details
                  </button>
                </div>
              </div>

              {batch.examDate || batch.reportingTime || batch.examCentreName ? (
                <p className="mt-2 text-xs text-muted">
                  {batch.examDate && new Date(batch.examDate).toLocaleDateString()}
                  {batch.reportingTime && ` · ${batch.reportingTime}`}
                  {batch.examCentreName && ` · ${batch.examCentreName}`}
                </p>
              ) : null}

              {editingId === batch.id && (
                <form onSubmit={(e) => saveExamDetails(batch.id, e)} className="mt-3 grid max-w-xl gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Exam Date</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Reporting Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={reportingTime}
                      onChange={(e) => setReportingTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Exam Centre Name</label>
                    <input
                      type="text"
                      placeholder="e.g. University Auditorium"
                      value={examCentreName}
                      onChange={(e) => setExamCentreName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Exam Centre Address</label>
                    <input
                      type="text"
                      value={examCentreAddress}
                      onChange={(e) => setExamCentreAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                    >
                      {loading ? "Saving…" : "Save Exam Details"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
