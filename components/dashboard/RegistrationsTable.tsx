"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE, PaginationControls, usePagination } from "@/components/dashboard/Pagination";
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
  const [genderFilter, setGenderFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");

  const courses = useMemo(
    () => Array.from(new Set(registrations.map((r) => r.programme).filter(Boolean))) as string[],
    [registrations],
  );

  const genders = useMemo(
    () => Array.from(new Set(registrations.map((r) => r.admission?.gender).filter(Boolean))) as string[],
    [registrations],
  );

  // coachingDiscipline only exists on Diploma in Sports Coaching applications.
  const isDiplomaSelected = courseFilter !== "" && formatProgramme(courseFilter) === "Diploma in Sports Coaching";

  const disciplines = useMemo(
    () =>
      Array.from(
        new Set(
          registrations
            .filter((r) => formatProgramme(r.programme) === "Diploma in Sports Coaching")
            .map((r) => r.admission?.coachingDiscipline)
            .filter(Boolean),
        ),
      ) as string[],
    [registrations],
  );

  const filtered = registrations
    .filter((r) => !courseFilter || r.programme === courseFilter)
    .filter((r) => !genderFilter || r.admission?.gender === genderFilter)
    .filter((r) => !isDiplomaSelected || !disciplineFilter || r.admission?.coachingDiscipline === disciplineFilter);

  const { page, setPage, totalPages, paged } = usePagination(filtered);

  const columns: Column<Student>[] = [
    { header: "S.No.", accessor: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
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
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setDisciplineFilter("");
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {formatProgramme(c)}
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
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={paged}
          emptyLabel={
            courseFilter || genderFilter || disciplineFilter ? "No registrations match this filter" : "No registrations yet"
          }
        />
      </div>
      <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
