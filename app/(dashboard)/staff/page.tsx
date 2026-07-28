import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import type { Staff } from "@/types/api";

export default async function StaffPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/unauthorized");

  const staff = (await serverApiFetch<Staff[]>("/staff")) ?? [];
  const columns: Column<Staff>[] = [
    { header: "Email", accessor: (row) => row.user.email },
    { header: "Department", accessor: (row) => row.department ?? "—" },
    { header: "Designation", accessor: (row) => row.designation ?? "—" },
  ];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Staff</h2>
      <div className="mt-4">
        <DataTable columns={columns} rows={staff} emptyLabel="No staff yet" />
      </div>
    </div>
  );
}
