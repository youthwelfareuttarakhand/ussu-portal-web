"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE, PaginationControls } from "@/components/dashboard/Pagination";
import { formatProgramme } from "@/lib/programme";
import { exportToExcel } from "@/lib/export-excel";
import { apiFetch } from "@/lib/api";
import { COURSE_OPTIONS, DISCIPLINE_OPTIONS, GENDER_OPTIONS } from "@/lib/filter-options";
import type { Admission, PaginatedResult } from "@/types/api";

type Filters = { course: string; gender: string; discipline: string; search: string };

export function AdmissionsQueueTable({
  admissions,
  total,
  page,
  filters,
}: {
  admissions: Admission[];
  total: number;
  page: number;
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDiplomaSelected = filters.course === "Diploma in Sports Coaching";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Debounced so typing doesn't push a new URL (and re-fetch) on every
  // keystroke — waits 400ms after the user stops typing.
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => setSearchInput(filters.search), [filters.search]);
  useEffect(() => {
    if (searchInput === filters.search) return;
    const timeout = setTimeout(() => updateParams({ search: searchInput }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(next: Partial<Filters & { page: number }>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === "" || value === undefined || value === null) params.delete(key);
      else params.set(key, String(value));
    }
    // Any filter change resets to page 1 — the old page number may not exist
    // in the newly-filtered result set.
    if (!("page" in next)) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleExport() {
    const qs = new URLSearchParams({ all: "true" });
    if (filters.course) qs.set("course", filters.course);
    if (filters.gender) qs.set("gender", filters.gender);
    if (filters.discipline) qs.set("discipline", filters.discipline);
    if (filters.search) qs.set("search", filters.search);
    const result = await apiFetch<PaginatedResult<Admission>>(`/admissions?${qs}`);
    exportToExcel(
      result.data,
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
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, or roll no."
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
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
          rows={admissions}
          emptyLabel={
            filters.course || filters.gender || filters.discipline ? "No applications match this filter" : "No applications yet"
          }
          rowHref={(row) => `/admissions/${row.id}`}
        />
      </div>
      <PaginationControls page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: p })} />
    </>
  );
}
