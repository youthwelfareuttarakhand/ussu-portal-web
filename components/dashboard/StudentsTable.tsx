"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { PAGE_SIZE, PaginationControls } from "@/components/dashboard/Pagination";
import { formatProgramme } from "@/lib/programme";
import { exportToExcel } from "@/lib/export-excel";
import { apiFetch } from "@/lib/api";
import { COURSE_OPTIONS, DISCIPLINE_OPTIONS, GENDER_OPTIONS } from "@/lib/filter-options";
import type { PaginatedResult, Student } from "@/types/api";

type Filters = { course: string; gender: string; discipline: string; search: string; feeStatus: string };

// Excel cell: rupees as a number so the column can be summed; blank when the
// student has no fee structure at all.
const rupees = (paise: number | undefined) => (paise === undefined ? "" : paise / 100);

// PARTIAL is deliberately not offered: the portal only pays all outstanding
// fee line items in one combined checkout (FeesService.payAll), so a student
// can't reach a partially-paid state through normal use. The PARTIAL badge
// maps below stay as a fallback in case a row ends up in that state manually.
const FEE_STATUS_OPTIONS = [
  { value: "", label: "All Fee Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "NA", label: "Not Applicable" },
];

const FEE_STATUS_BADGE_CLASS: Record<NonNullable<Student["feeStatus"]>, string> = {
  PAID: "bg-success/15 text-success",
  PARTIAL: "bg-warning/15 text-warning",
  UNPAID: "bg-accent/10 text-accent",
  NA: "bg-slate-100 text-faint",
};

const FEE_STATUS_LABEL: Record<NonNullable<Student["feeStatus"]>, string> = {
  PAID: "Paid",
  PARTIAL: "Partially Paid",
  UNPAID: "Unpaid",
  NA: "Not Applicable",
};

export function StudentsTable({
  students,
  total,
  page,
  filters,
}: {
  students: Student[];
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
  // keystroke — same pattern as AdmissionsQueueTable.
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
    if (!("page" in next)) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleExport() {
    const qs = new URLSearchParams({ all: "true" });
    if (filters.course) qs.set("course", filters.course);
    if (filters.gender) qs.set("gender", filters.gender);
    if (filters.discipline) qs.set("discipline", filters.discipline);
    if (filters.search) qs.set("search", filters.search);
    if (filters.feeStatus) qs.set("feeStatus", filters.feeStatus);
    const result = await apiFetch<PaginatedResult<Student>>(`/students?${qs}`);
    exportToExcel(
      result.data,
      [
        { header: "S.No.", value: (_row, index) => index + 1 },
        { header: "Name", value: (row) => row.user.fullName ?? "" },
        { header: "Email", value: (row) => row.user.email },
        { header: "UKSSU ID", value: (row) => row.user.ukssuId ?? "" },
        { header: "Programme", value: (row) => formatProgramme(row.programme) },
        { header: "Roll No.", value: (row) => row.rollNumber ?? "" },
        { header: "Fee Status", value: (row) => (row.feeStatus ? FEE_STATUS_LABEL[row.feeStatus] : "") },
        { header: "Tuition Fee (₹)", value: (row) => rupees(row.feeAmounts?.tuitionPaise) },
        { header: "Hostel Fee (₹)", value: (row) => rupees(row.feeAmounts?.hostelPaise) },
        { header: "Total Fee (₹)", value: (row) => rupees(row.feeAmounts?.totalPaise) },
        { header: "Amount Paid (₹)", value: (row) => rupees(row.feeAmounts?.paidPaise) },
        { header: "Amount Due (₹)", value: (row) => rupees(row.feeAmounts?.duePaise) },
      ],
      "students.xlsx",
    );
  }

  const columns: Column<Student>[] = [
    { header: "S.No.", accessor: (_row, index) => (page - 1) * PAGE_SIZE + index + 1 },
    { header: "Name", accessor: (row) => row.user.fullName },
    { header: "Email", accessor: (row) => row.user.email },
    { header: "UKSSU ID", accessor: (row) => row.user.ukssuId ?? "—" },
    { header: "Programme", accessor: (row) => formatProgramme(row.programme) },
    { header: "Roll No.", accessor: (row) => row.rollNumber ?? "—" },
    {
      header: "Fees",
      accessor: (row) =>
        row.feeStatus ? (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${FEE_STATUS_BADGE_CLASS[row.feeStatus]}`}>
            {FEE_STATUS_LABEL[row.feeStatus]}
          </span>
        ) : (
          "—"
        ),
    },
    {
      header: "",
      disableRowLink: true,
      accessor: (row) =>
        row.admission ? (
          <Link href={`/admissions/${row.admission.id}`} className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
            View Details
          </Link>
        ) : null,
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
        <select
          value={filters.feeStatus}
          onChange={(e) => updateParams({ feeStatus: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {FEE_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
          rows={students}
          emptyLabel={
            filters.course || filters.gender || filters.discipline || filters.search || filters.feeStatus
              ? "No students match this filter"
              : "No students have completed admission yet"
          }
        />
      </div>
      <PaginationControls page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: p })} />
    </>
  );
}
