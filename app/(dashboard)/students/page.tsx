import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import type { Student } from "@/types/api";

export default async function StudentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const students = (await serverApiFetch<Student[]>("/students")) ?? [];
  const columns: Column<Student>[] = [
    { header: "Email", accessor: (row) => row.user.email },
    { header: "Roll No.", accessor: (row) => row.rollNumber ?? "—" },
    { header: "Programme", accessor: (row) => row.programme ?? "—" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">Students</h2>
      <div className="mt-4">
        <DataTable columns={columns} rows={students} emptyLabel="No students yet" />
      </div>
    </div>
  );
}
