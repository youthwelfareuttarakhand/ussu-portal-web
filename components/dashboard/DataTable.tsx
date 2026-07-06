export type Column<T> = {
  header: string;
  accessor: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = "Nothing here yet",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3 text-body">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
