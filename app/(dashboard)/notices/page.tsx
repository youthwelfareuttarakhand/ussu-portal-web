import { serverApiFetch } from "@/lib/server-api";
import type { Notice } from "@/types/api";

export default async function NoticesPage() {
  const notices = (await serverApiFetch<Notice[]>("/notices")) ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Notices</h2>
      <div className="mt-4 space-y-3">
        {notices.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No notices yet
          </p>
        )}
        {notices.map((notice) => (
          <div key={notice.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-ink">{notice.title}</p>
            <p className="mt-1 text-sm text-muted">{notice.body}</p>
            <p className="mt-2 text-xs text-faint">{new Date(notice.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
