import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { Reveal } from "@/components/Reveal";
import { formatProgramme } from "@/lib/programme";
import type { Admission } from "@/types/api";

export default async function AdmissionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.role === "STUDENT") {
    const admission = await serverApiFetch<Admission>("/admissions/me");
    return (
      <div>
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">My Admission</h2>
        {!admission ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No admission application on file yet
          </p>
        ) : (
          <Reveal className="mt-4 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-primary via-primary to-accent" />
            <div className="p-6">
              <p className="text-sm text-muted">Status</p>
              <div className="mt-2">
                <StatusBadge status={admission.status} />
              </div>
              <p className="mt-4 text-xs text-faint">
                Submitted {new Date(admission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    );
  }

  const admissions = (await serverApiFetch<Admission[]>("/admissions")) ?? [];
  const columns: Column<Admission>[] = [
    { header: "Student", accessor: (row) => row.student.user.fullName },
    { header: "Programme", accessor: (row) => formatProgramme(row.student.programme, row.coachingDiscipline) },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Paid",
      accessor: (row) =>
        row.paid ? <span className="text-success">●</span> : <span className="text-faint">○</span>,
    },
    { header: "Submitted", accessor: (row) => new Date(row.submittedAt).toLocaleDateString() },
  ];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Admissions Queue</h2>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={admissions}
          emptyLabel="No applications yet"
          rowHref={(row) => `/admissions/${row.id}`}
        />
      </div>
    </div>
  );
}
