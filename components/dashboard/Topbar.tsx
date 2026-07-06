"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/lib/roles";

const ROLE_BADGE_CLASS: Record<Role, string> = {
  STUDENT: "bg-secondary/15 text-secondary",
  STAFF: "bg-warning/15 text-warning",
  ADMIN: "bg-accent/15 text-accent",
};

export function Topbar({ email, role, title }: { email: string; role: Role; title: string }) {
  const router = useRouter();

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-surface px-6 py-4">
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASS[role]}`}>{role}</span>
        <span className="text-sm text-muted">{email}</span>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-ink"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
