import { redirect } from "next/navigation";
import { GraduationCap, UserCog, ClipboardList, Bell, CheckCircle2, Eye, type LucideIcon } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevealGroup, RevealItem, Reveal } from "@/components/Reveal";
import { EyebrowSwoosh } from "@/components/EyebrowSwoosh";
import { RegistrationTrendChart } from "@/components/dashboard/charts/RegistrationTrendChart";
import { VisitorActivityChart } from "@/components/dashboard/charts/VisitorActivityChart";
import type { Admission, AnalyticsOverview, Notice, VisitorStats } from "@/types/api";

const PENDING_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW"]);

type Stat = { label: string; value: string | number; tone: "primary" | "accent" | "gold"; icon: LucideIcon };

async function statsForNonAdmin(role: string): Promise<Stat[]> {
  if (role === "STUDENT") {
    const [admission, notices] = await Promise.all([
      serverApiFetch<Admission>("/admissions/me"),
      serverApiFetch<Notice[]>("/notices"),
    ]);
    return [
      {
        label: "Admission Status",
        value: admission ? admission.status.replace("_", " ") : "Not submitted",
        tone: "primary",
        icon: ClipboardList,
      },
      { label: "Notices", value: (notices ?? []).length, tone: "accent", icon: Bell },
    ];
  }

  const admissions = (await serverApiFetch<Admission[]>("/admissions")) ?? [];
  const pending = admissions.filter((a) => PENDING_STATUSES.has(a.status)).length;
  const students = (await serverApiFetch<{ id: string }[]>("/students")) ?? [];
  return [
    { label: "Pending Registration", value: pending, tone: "accent", icon: ClipboardList },
    { label: "Students", value: students.length, tone: "primary", icon: GraduationCap },
  ];
}

function VisitorOverviewRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${tone}`}>
          {label.charAt(0)}
        </span>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <span className="font-display text-lg text-ink">{value.toLocaleString()}</span>
    </div>
  );
}

async function AdminDashboard() {
  const [overview, visitors] = await Promise.all([
    serverApiFetch<AnalyticsOverview>("/analytics/overview"),
    serverApiFetch<VisitorStats>("/analytics/visitors"),
  ]);

  const stats: Stat[] = overview
    ? [
        { label: "Total Registrations", value: overview.totalRegistrations, tone: "primary", icon: ClipboardList },
        { label: "Registration Completed", value: overview.admissionsCompleted, tone: "gold", icon: CheckCircle2 },
        { label: "Pending Registration", value: overview.pendingAdmissions, tone: "accent", icon: Eye },
        { label: "Total Students", value: overview.totalStudents, tone: "primary", icon: GraduationCap },
        { label: "Total Staff", value: overview.totalStaff, tone: "gold", icon: UserCog },
      ]
    : [];

  return (
    <>
      <RevealGroup className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <RevealItem key={stat.label} delayMs={i * 80}>
            <StatCard label={stat.label} value={stat.value} tone={stat.tone} icon={stat.icon} />
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-display text-sm uppercase tracking-wide text-ink">Registration Trend</p>
          <p className="text-xs text-faint">Last 7 days</p>
          <div className="mt-2">
            <RegistrationTrendChart data={overview?.registrationTrend ?? []} />
          </div>
        </Reveal>

        <Reveal delayMs={80} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-display text-sm uppercase tracking-wide text-ink">Visitor Activity</p>
          <p className="text-xs text-faint">Last 7 days</p>
          <div className="mt-2">
            <VisitorActivityChart data={visitors?.trend ?? []} />
          </div>
        </Reveal>
      </div>

      <Reveal delayMs={120} className="mt-4 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-display text-sm uppercase tracking-wide text-ink">Visitor Overview</p>
        <div className="mt-2 divide-y divide-slate-100">
          <VisitorOverviewRow label="Total Visitors" value={visitors?.totalUnique ?? 0} tone="bg-primary/10 text-primary" />
          <VisitorOverviewRow label="Last 7 Days" value={visitors?.last7Days ?? 0} tone="bg-secondary/10 text-secondary" />
          <VisitorOverviewRow label="This Month" value={visitors?.thisMonth ?? 0} tone="bg-gold/15 text-gold" />
          <VisitorOverviewRow label="This Year" value={visitors?.thisYear ?? 0} tone="bg-accent/10 text-accent" />
        </div>
      </Reveal>
    </>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Overview</p>
      <EyebrowSwoosh />
      <h2 className="mt-2 font-display text-xl uppercase tracking-wide text-ink">Welcome back</h2>

      {user.role === "ADMIN" ? (
        <AdminDashboard />
      ) : (
        <StatsRow role={user.role} />
      )}
    </div>
  );
}

async function StatsRow({ role }: { role: string }) {
  const stats = await statsForNonAdmin(role);
  return (
    <RevealGroup className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => (
        <RevealItem key={stat.label} delayMs={i * 80}>
          <StatCard label={stat.label} value={stat.value} tone={stat.tone} icon={stat.icon} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
