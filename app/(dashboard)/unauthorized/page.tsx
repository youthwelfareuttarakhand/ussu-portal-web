import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <ShieldAlert size={28} />
      </span>
      <h2 className="mt-6 font-display text-xl uppercase tracking-wide text-ink">Access Denied</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">Your role doesn&rsquo;t have access to this page.</p>
      <Link
        href="/dashboard"
        className="group relative mt-6 inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-b from-accent to-accent-dark px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/25 transition-transform hover:-translate-y-px"
      >
        <span className="absolute inset-0 -translate-x-full bg-accent-dark transition-transform duration-300 ease-out group-hover:translate-x-0" />
        <span className="relative">Back to Dashboard</span>
      </Link>
    </div>
  );
}
