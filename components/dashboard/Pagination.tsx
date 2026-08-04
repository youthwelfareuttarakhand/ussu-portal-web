"use client";

import { useEffect, useState } from "react";

export const PAGE_SIZE = 10;

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

  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
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
