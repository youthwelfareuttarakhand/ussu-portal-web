import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import type { AdmissionStatus } from "@/types/api";

export type Column<T> = {
  header: string;
  accessor: (row: T, index: number) => React.ReactNode;
  // Set for action columns (e.g. a download link) that shouldn't be wrapped
  // in the row's navigation Link — nesting an <a> inside it would either be
  // invalid HTML or hijack the click into a row-navigation instead.
  disableRowLink?: boolean;
};

const STATUS_BADGE_CLASS: Record<AdmissionStatus, string> = {
  SUBMITTED: "bg-primary/10 text-primary",
  UNDER_REVIEW: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-accent/10 text-accent",
};

export function StatusBadge({ status }: { status: AdmissionStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = "Nothing here yet",
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
  rowHref?: (row: T) => string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <Reveal className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface font-display text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const href = rowHref?.(row);
              return (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 transition-colors hover:bg-surface/60 ${href ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 text-body">
                      {href && !col.disableRowLink ? (
                        <Link href={href} className="block">
                          {col.accessor(row, index)}
                        </Link>
                      ) : (
                        col.accessor(row, index)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
