import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import type { Admission } from "@/types/api";

export default async function AdmissionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.role === "STUDENT") {
    const admission = await serverApiFetch<Admission>("/admissions/me");
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink">My Admission</h2>
        {!admission ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
            No admission application on file yet
          </p>
        ) : (
          <div className="mt-4 max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-muted">Status</p>
            <p className="mt-1 text-xl font-bold text-ink">{admission.status.replace("_", " ")}</p>
            <p className="mt-3 text-xs text-faint">
              Submitted {new Date(admission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    );
  }

  const admissions = (await serverApiFetch<Admission[]>("/admissions")) ?? [];
  const columns: Column<Admission>[] = [
    { header: "Student", accessor: (row) => row.studentId },
    { header: "Status", accessor: (row) => row.status.replace("_", " ") },
    { header: "Submitted", accessor: (row) => new Date(row.submittedAt).toLocaleDateString() },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Admissions Queue</h2>
      <div className="mt-4">
        <DataTable columns={columns} rows={admissions} emptyLabel="No applications yet" />
      </div>
    </div>
  );
}
