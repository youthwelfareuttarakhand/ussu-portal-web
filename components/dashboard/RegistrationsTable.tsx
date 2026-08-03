"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { formatProgramme } from "@/lib/programme";
import type { Student } from "@/types/api";

function statusLabel(admission: Student["admission"]) {
  if (!admission) return <span className="text-faint">Not started</span>;
  if (!admission.paid) return <span className="text-warning">In progress</span>;
  if (!admission.status) return <span className="text-faint">—</span>;
  return <StatusBadge status={admission.status} />;
}

export function RegistrationsTable({ registrations }: { registrations: Student[] }) {
  const [courseFilter, setCourseFilter] = useState("");

  const courses = useMemo(
    () => Array.from(new Set(registrations.map((r) => r.programme).filter(Boolean))) as string[],
    [registrations],
  );

  const filtered = courseFilter ? registrations.filter((r) => r.programme === courseFilter) : registrations;

  const columns: Column<Student>[] = [
    { header: "Reg. No.", accessor: (row) => row.user.registrationNumber ?? "—" },
    { header: "Name", accessor: (row) => row.user.fullName ?? "—" },
    { header: "Email", accessor: (row) => row.user.email },
    { header: "Phone", accessor: (row) => row.user.phone ?? "—" },
    { header: "Course", accessor: (row) => formatProgramme(row.programme, row.admission?.coachingDiscipline) },
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
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={filtered}
          emptyLabel={courseFilter ? "No registrations match this filter" : "No registrations yet"}
        />
      </div>
    </>
  );
}
