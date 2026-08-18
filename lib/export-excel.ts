import * as XLSX from "xlsx";

export type ExportColumn<T> = {
  header: string;
  value: (row: T, index: number) => string | number;
};

export function exportToExcel<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  const data = rows.map((row, index) =>
    Object.fromEntries(columns.map((c) => [c.header, c.value(row, index)])),
  );
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}
