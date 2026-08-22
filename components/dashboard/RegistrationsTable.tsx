"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE, PaginationControls } from "@/components/dashboard/Pagination";
import { formatProgramme } from "@/lib/programme";
import { exportToExcel } from "@/lib/export-excel";
import { apiFetch } from "@/lib/api";
import { COURSE_OPTIONS, DISCIPLINE_OPTIONS, GENDER_OPTIONS } from "@/lib/filter-options";
import type { PaginatedResult, Student } from "@/types/api";

type Filters = { course: string; gender: string; discipline: string };

function statusLabel(admission: Student["admission"]) {
  if (!admission) return <span className="text-faint">Not started</span>;
  if (!admission.paid) return <span className="text-warning">In progress</span>;
  if (!admission.status) return <span className="text-faint">—</span>;
  return <StatusBadge status={admission.status} />;
}

function statusText(admission: Student["admission"]) {
  if (!admission) return "Not started";
  if (!admission.paid) return "In progress";
  return admission.status ?? "—";
}

export function RegistrationsTable({
  registrations,
  total,
  page,
  filters,
}: {
  registrations: Student[];
  total: number;
  page: number;
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDiplomaSelected = filters.course === "Diploma in Sports Coaching";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function updateParams(next: Partial<Filters & { page: number }>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === "" || value === undefined || value === null) params.delete(key);
      else params.set(key, String(value));
    }
    if (!("page" in next)) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleExport() {
    const qs = new URLSearchParams({ all: "true" });
    if (filters.course) qs.set("course", filters.course);
    if (filters.gender) qs.set("gender", filters.gender);
    if (filters.discipline) qs.set("discipline", filters.discipline);
    const result = await apiFetch<PaginatedResult<Student>>(`/students/registrations?${qs}`);
    exportToExcel(
      result.data,
      [
        { header: "S.No.", value: (_row, index) => index + 1 },
        { header: "Reg. No.", value: (row) => row.user.registrationNumber ?? "—" },
        { header: "Name", value: (row) => row.user.fullName ?? "—" },
        { header: "Email", value: (row) => row.user.email },
        { header: "Phone", value: (row) => row.user.phone ?? "—" },
        { header: "Course", value: (row) => formatProgramme(row.programme, row.admission?.coachingDiscipline) },
        { header: "Application Status", value: (row) => statusText(row.admission) },
      ],
      "registrations.xlsx",
    );
  }

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
          value={filters.course}
          onChange={(e) => updateParams({ course: e.target.value, discipline: "" })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Courses</option>
          {COURSE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {formatProgramme(c)}
            </option>
          ))}
        </select>
        {isDiplomaSelected && (
          <select
            value={filters.discipline}
            onChange={(e) => updateParams({ discipline: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All Sports</option>
            {DISCIPLINE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
        <select
          value={filters.gender}
          onChange={(e) => updateParams({ gender: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">All Genders</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={total === 0}
          className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={registrations}
          emptyLabel={
            filters.course || filters.gender || filters.discipline ? "No registrations match this filter" : "No registrations yet"
          }
        />
      </div>
      <PaginationControls page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: p })} />
    </>
  );
}
