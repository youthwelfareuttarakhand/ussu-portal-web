import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import type { Student } from "@/types/api";

export default async function StudentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  // /students only returns students who've actually completed admission
  // (paid) — see StudentsService.findAll's comment. Applicants who've only
  // registered or started the admission form don't show up here.
  const students = (await serverApiFetch<Student[]>("/students")) ?? [];
  const columns: Column<Student>[] = [
    { header: "Email", accessor: (row) => row.user.email },
    { header: "UKSSU ID", accessor: (row) => row.user.ukssuId ?? "—" },
    { header: "Programme", accessor: (row) => row.programme ?? "—" },
    {
      header: "",
      accessor: (row) =>
        row.admission ? (
          <Link href={`/admissions/${row.admission.id}`} className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
            View Admission Form
          </Link>
        ) : null,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Students</h2>
      <p className="mt-1 text-sm text-muted">Applicants who have completed the admission process.</p>
      <div className="mt-4">
        <DataTable columns={columns} rows={students} emptyLabel="No students have completed admission yet" />
      </div>
    </div>
  );
}
