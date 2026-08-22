"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE, PaginationControls, usePagination } from "@/components/dashboard/Pagination";
import { formatProgramme } from "@/lib/programme";
import { exportToExcel } from "@/lib/export-excel";
import type { Admission } from "@/types/api";

export function AdmissionsQueueTable({ admissions }: { admissions: Admission[] }) {
  const [courseFilter, setCourseFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");

  const courses = useMemo(
    () => Array.from(new Set(admissions.map((a) => formatProgramme(a.student.programme)).filter((c) => c !== "—"))),
    [admissions],
  );

  const genders = useMemo(
    () => Array.from(new Set(admissions.map((a) => a.gender).filter(Boolean))) as string[],
    [admissions],
  );

  // coachingDiscipline only exists on Diploma in Sports Coaching applications.
  const isDiplomaSelected = courseFilter === "Diploma in Sports Coaching";

  const disciplines = useMemo(
    () =>
      Array.from(
        new Set(
          admissions
            .filter((a) => formatProgramme(a.student.programme) === "Diploma in Sports Coaching")
            .map((a) => a.coachingDiscipline)
            .filter(Boolean),
        ),
      ) as string[],
    [admissions],
  );

  const filtered = admissions
    .filter((a) => !courseFilter || formatProgramme(a.student.programme) === courseFilter)
    .filter((a) => !genderFilter || a.gender === genderFilter)
    .filter((a) => !isDiplomaSelected || !disciplineFilter || a.coachingDiscipline === disciplineFilter);

  const { page, setPage, totalPages, paged } = usePagination(filtered);

  function handleExport() {
    exportToExcel(
      filtered,
      [
        { header: "S.No.", value: (_row, index) => index + 1 },
        { header: "Student", value: (row) => row.student.user.fullName },
        { header: "Programme", value: (row) => formatProgramme(row.student.programme, row.coachingDiscipline) },
        { header: "Roll No.", value: (row) => row.student.rollNumber ?? "" },
        { header: "Status", value: (row) => row.status },
        { header: "Paid", value: (row) => (row.paid ? "Yes" : "No") },
        { header: "Submitted", value: (row) => new Date(row.submittedAt).toLocaleDateString() },
      ],
      "admissions-queue.xlsx",
    );
  }

  const columns: Column<Admission>[] = [
    { header: "S.No.", accessor: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
    { header: "Student", accessor: (row) => row.student.user.fullName },
    { header: "Programme", accessor: (row) => formatProgramme(row.student.programme, row.coachingDiscipline) },
    { header: "Roll No.", accessor: (row) => row.student.rollNumber ?? "—" },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Paid",
      accessor: (row) =>
        row.paid ? <span className="text-success">●</span> : <span className="text-faint">○</span>,
    },
    { header: "Submitted", accessor: (row) => new Date(row.submittedAt).toLocaleDateString() },
    {
      header: "Admit Card",
      disableRowLink: true,
      accessor: (row) =>
        row.student.rollNumber ? (
          <a
            href={`/api/admissions/${row.id}/admit-card`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download Admit Card"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={14} />
          </a>
        ) : (
          <span className="text-faint">—</span>
        ),
    },
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setDisciplineFilter("");
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {isDiplomaSelected && (
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All Sports</option>
            {disciplines.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Genders</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={paged}
          emptyLabel={
            courseFilter || genderFilter || disciplineFilter ? "No applications match this filter" : "No applications yet"
          }
          rowHref={(row) => `/admissions/${row.id}`}
        />
      </div>
      <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
