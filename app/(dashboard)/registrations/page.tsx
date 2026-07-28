import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import type { Student } from "@/types/api";

function statusLabel(admission: Student["admission"]) {
  if (!admission) return <span className="text-faint">Not started</span>;
  if (!admission.paid) return <span className="text-warning">In progress</span>;
  if (!admission.status) return <span className="text-faint">—</span>;
  return <StatusBadge status={admission.status} />;
}

export default async function RegistrationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const registrations = (await serverApiFetch<Student[]>("/students/registrations")) ?? [];
  const columns: Column<Student>[] = [
    { header: "Reg. No.", accessor: (row) => row.user.registrationNumber ?? "—" },
    { header: "Name", accessor: (row) => row.user.fullName ?? "—" },
    { header: "Email", accessor: (row) => row.user.email },
    { header: "Phone", accessor: (row) => row.user.phone ?? "—" },
    { header: "Application Status", accessor: statusLabel },
    {
      header: "",
      accessor: (row) =>
        row.admission ? (
          <Link href={`/admissions/${row.admission.id}`} className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
            View
          </Link>
        ) : null,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Registrations</h2>
      <p className="mt-1 text-sm text-muted">Everyone who has registered, regardless of admission progress.</p>
      <div className="mt-4">
        <DataTable columns={columns} rows={registrations} emptyLabel="No registrations yet" />
      </div>
    </div>
  );
}
