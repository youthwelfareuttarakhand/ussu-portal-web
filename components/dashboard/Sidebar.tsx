"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole, type Role } from "@/lib/roles";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-ink text-white">
      <div className="px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">USSU</p>
        <p className="text-lg font-bold">Portal</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-accent bg-primary-dark/40 text-white"
                  : "border-transparent text-faint hover:bg-primary-dark/20 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
