"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Bell,
  ClipboardList,
  FileEdit,
  Users,
  UserCog,
  CalendarRange,
  Wallet,
  ChevronDown,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { navForRole, type NavItem, type Role } from "@/lib/roles";

const ICON_BY_HREF: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/profile": User,
  "/notices": Bell,
  "/registrations": FileEdit,
  "/admissions": ClipboardList,
  "/students": Users,
  "/batches": CalendarRange,
  "/staff": UserCog,
  "/fees": Wallet,
};

function NavLink({ item, active, onNavigate, indent }: { item: NavItem; active: boolean; onNavigate?: () => void; indent?: boolean }) {
  const Icon = ICON_BY_HREF[item.href];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg border-l-4 py-2.5 text-sm font-medium transition-colors ${indent ? "pl-9 pr-3" : "px-3"} ${
        active
          ? "border-gold bg-white/5 text-white"
          : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      {Icon && <Icon size={18} className="shrink-0" />}
      {item.label}
    </Link>
  );
}

function NavGroup({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const children = item.children ?? [];
  const groupActive = children.some((child) => pathname === child.href);
  const [open, setOpen] = useState(groupActive);
  const Icon = ICON_BY_HREF[item.href];

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition-colors ${
          groupActive ? "border-gold bg-white/5 text-white" : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
        }`}
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {children.map((child) => (
            <NavLink key={child.href} item={child} active={pathname === child.href} onNavigate={onNavigate} indent />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ role, pathname, onNavigate }: { role: Role; pathname: string; onNavigate?: () => void }) {
  const items = navForRole(role);

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <img src="/logo-transparent.png" alt="USSU crest" className="h-10 w-10 shrink-0" />
        <p className="font-display text-sm uppercase tracking-wide text-white">USSU Portal</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) =>
          item.children ? (
            <NavGroup key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ) : (
            <NavLink key={item.href} item={item} active={pathname === item.href} onNavigate={onNavigate} />
          ),
        )}
      </nav>
    </>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-dark text-white shadow-md md:hidden print:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-shrink-0 flex-col bg-primary-dark text-white transition-transform duration-300 ease-out md:translate-x-0 print:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent role={role} pathname={pathname} onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
