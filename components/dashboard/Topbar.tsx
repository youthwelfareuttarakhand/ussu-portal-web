"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/lib/roles";

const ROLE_BADGE_CLASS: Record<Role, string> = {
  STUDENT: "bg-primary/10 text-primary",
  STAFF: "bg-gold/15 text-gold",
  ADMIN: "bg-accent/10 text-accent",
};

export function Topbar({ email, role, title }: { email: string; role: Role; title: string }) {
  const router = useRouter();

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 pl-20 md:pl-6">
      <h1 className="font-display text-lg uppercase tracking-wide text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASS[role]}`}>{role}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase text-white">
          {email.charAt(0)}
        </span>
        <span className="hidden text-sm text-muted sm:block">{email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </header>
  );
}
