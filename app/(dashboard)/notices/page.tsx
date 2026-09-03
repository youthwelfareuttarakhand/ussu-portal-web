"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Paperclip, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import type { Notice } from "@/types/api";

const emptyForm = { title: "", body: "" };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reload() {
    apiFetch<Notice[]>("/notices")
      .then(setNotices)
      .catch(() => setNotices([]));
  }

  useEffect(reload, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(notice: Notice) {
    setEditingId(notice.id);
    setForm({ title: notice.title, body: notice.body });
    setFile(null);
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("body", form.body);
      if (file) body.append("file", file);

      if (editingId) {
        await apiFetch(`/notices/${editingId}`, { method: "PATCH", body });
      } else {
        await apiFetch("/notices", { method: "POST", body });
      }
      closeForm();
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the notice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice? This cannot be undone.")) return;
    setError("");
    try {
      await apiFetch(`/notices/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the notice. Please try again.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">Notices</h2>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={submit} className="mt-4 max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-ink">{editingId ? "Edit Notice" : "New Notice"}</p>
            <button type="button" onClick={closeForm} aria-label="Close" className="text-muted hover:text-ink">
              <X size={18} />
            </button>
          </div>

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
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label htmlFor="notice-file" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Attachment (PDF or image, optional)
            </label>
            <input
              id="notice-file"
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-ink hover:file:bg-slate-100"
            />
            {editingId && !file && (
              <p className="mt-1 text-xs text-muted">Leave empty to keep the current attachment.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <Plus size={16} />
            {loading ? "Saving…" : editingId ? "Save Changes" : "Post Notice"}
          </button>
          {error && <p className="text-sm font-semibold text-accent">{error}</p>}
        </form>
      )}

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
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{notice.title}</p>
                <p className="mt-1 text-sm text-muted">{notice.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-faint">
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  {notice.attachmentFilename && (
                    <a
                      href={`/api/notices/${notice.id}/attachment`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <Paperclip size={12} />
                      {notice.attachmentFilename}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-start gap-1">
                <button
                  type="button"
                  onClick={() => openEditForm(notice)}
                  aria-label="Edit notice"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-primary"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNotice(notice.id)}
                  aria-label="Delete notice"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
