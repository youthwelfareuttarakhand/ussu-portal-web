"use client";

import { useEffect, useState } from "react";
import { PAGE_SIZE } from "@/lib/constants";

export { PAGE_SIZE };

/** Paginates `items` client-side, resetting to page 1 whenever the filtered set changes. */
export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { page, setPage, totalPages, paged };
}

/** Builds the list of page numbers/ellipsis markers to render, keeping first, last, and a window around `page`. */
function buildPageItems(page: number, totalPages: number, siblings = 2): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);

  items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

export function PaginationControls({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={
              item === page
                ? "rounded-lg bg-primary px-3 py-1.5 font-semibold text-white"
                : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink hover:bg-slate-50"
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
