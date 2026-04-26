import * as XLSX from 'xlsx';

export type ExportCell = string | number | boolean | null | undefined;

type ExportExcelOptions = {
  fileName: string;
  sheetName: string;
  columns: string[];
  rows: ExportCell[][];
  titleRows?: ExportCell[][];
  columnWidths?: number[];
};

export function exportExcel({
  fileName,
  sheetName,
  columns,
  rows,
  titleRows = [],
  columnWidths,
}: ExportExcelOptions) {
  const sheetData: ExportCell[][] = [...titleRows, [], columns, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  if (columnWidths && columnWidths.length > 0) {
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
