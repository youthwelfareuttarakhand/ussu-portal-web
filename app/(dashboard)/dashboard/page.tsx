import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { EyebrowSwoosh } from "@/components/EyebrowSwoosh";

function statsForRole(role: string) {
  if (role === "STUDENT") {
    return [
      { label: "Admission Status", value: "Under Review", tone: "primary" as const },
      { label: "Notices", value: "3 new", tone: "accent" as const },
    ];
  }
  if (role === "STAFF") {
    return [
      { label: "Pending Admissions", value: 12, tone: "accent" as const },
      { label: "Students", value: 480, tone: "primary" as const },
    ];
  }
  return [
    { label: "Total Students", value: 480, tone: "primary" as const },
    { label: "Total Staff", value: 36, tone: "primary" as const },
    { label: "Pending Admissions", value: 12, tone: "accent" as const },
  ];
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const stats = statsForRole(user.role);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Overview</p>
      <EyebrowSwoosh />
      <h2 className="mt-2 text-xl font-bold text-ink">Welcome back</h2>

      <RevealGroup className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <RevealItem key={stat.label} delayMs={i * 80}>
            <StatCard label={stat.label} value={stat.value} tone={stat.tone} />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
