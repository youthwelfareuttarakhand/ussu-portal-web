"use client";

import { useMemo, useState } from "react";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { formatProgramme } from "@/lib/programme";
import type { Admission } from "@/types/api";

export function AdmissionsQueueTable({ admissions }: { admissions: Admission[] }) {
  const [courseFilter, setCourseFilter] = useState("");

  const courses = useMemo(
    () => Array.from(new Set(admissions.map((a) => formatProgramme(a.student.programme)).filter((c) => c !== "—"))),
    [admissions],
  );

  const filtered = courseFilter
    ? admissions.filter((a) => formatProgramme(a.student.programme) === courseFilter)
    : admissions;

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
          emptyLabel={courseFilter ? "No applications match this filter" : "No applications yet"}
          rowHref={(row) => `/admissions/${row.id}`}
        />
      </div>
    </>
  );
}
