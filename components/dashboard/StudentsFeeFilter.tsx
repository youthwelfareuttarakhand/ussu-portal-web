"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const FEE_STATUS_OPTIONS = [
  { value: "", label: "All Fee Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partially Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "NA", label: "Not Applicable" },
];

export function StudentsFeeFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("feeStatus", next);
    else params.delete("feeStatus");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
    >
      {FEE_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
