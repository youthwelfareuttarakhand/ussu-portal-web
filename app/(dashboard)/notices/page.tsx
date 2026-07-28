import { Bell } from "lucide-react";
import { serverApiFetch } from "@/lib/server-api";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import type { Notice } from "@/types/api";

export default async function NoticesPage() {
  const notices = (await serverApiFetch<Notice[]>("/notices")) ?? [];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Notices</h2>
      <RevealGroup className="mt-4 space-y-3">
        {notices.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No notices yet
          </p>
        )}
        {notices.map((notice, i) => (
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
