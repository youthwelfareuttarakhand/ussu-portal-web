"use client";

import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import type { Notice } from "@/types/api";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reload() {
    apiFetch<Notice[]>("/notices")
      .then(setNotices)
      .catch(() => setNotices([]));
  }

  useEffect(reload, []);

  async function createNotice(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/notices", { method: "POST", body: JSON.stringify({ title, body }) });
      setTitle("");
      setBody("");
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post the notice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Notices</h2>

      <form onSubmit={createNotice} className="mt-4 max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label htmlFor="notice-title" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Title
          </label>
          <input
            id="notice-title"
            type="text"
            required
            minLength={3}
            placeholder="e.g. Admissions open for 2026-27"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label htmlFor="notice-body" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Details
          </label>
          <textarea
            id="notice-body"
            required
            minLength={3}
            rows={3}
            placeholder="e.g. Applications for all programmes are now open."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <Plus size={16} />
          {loading ? "Posting…" : "Post Notice"}
        </button>
        {error && <p className="text-sm font-semibold text-accent">{error}</p>}
      </form>

      <RevealGroup className="mt-6 space-y-3">
        {notices?.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No notices yet
          </p>
        )}
        {notices?.map((notice, i) => (
          <RevealItem key={notice.id} delayMs={i * 60}>
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell size={16} />
              </span>
              <div>
                <p className="font-semibold text-ink">{notice.title}</p>
                <p className="mt-1 text-sm text-muted">{notice.body}</p>
                <p className="mt-2 text-xs text-faint">{new Date(notice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
