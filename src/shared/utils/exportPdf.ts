import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportCell } from './exportExcel';

type PdfColumnStyle = {
  cellWidth?: number | 'auto' | 'wrap';
};

type ExportPdfOptions = {
  fileName: string;
  title: string;
  metadataRows?: string[];
  columns: string[];
  rows: ExportCell[][];
  columnStyles?: Record<number, PdfColumnStyle>;
};

export function exportPdf({
  fileName,
  title,
  metadataRows = [],
  columns,
  rows,
  columnStyles,
}: ExportPdfOptions) {
  const tableRows = rows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) {
        return '';
      }

      if (typeof cell === 'boolean') {
        return cell ? 'true' : 'false';
      }

      return cell;
    }),
  );
  const document = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });
  const metadataStartY = 25;
  const metadataLineHeight = 5;

  document.setFont('helvetica', 'bold');
  document.setFontSize(16);
  document.text(title, 14, 18);

  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  metadataRows.forEach((metadata, index) => {
    document.text(metadata, 14, metadataStartY + index * metadataLineHeight);
  });

  autoTable(document, {
    head: [columns],
    body: tableRows,
    startY: metadataStartY + metadataRows.length * metadataLineHeight + 6,
    margin: { top: 14, left: 14, right: 14, bottom: 14 },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.2,
      textColor: [17, 24, 39],
      lineColor: [209, 213, 219],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles,
  });

  const totalPages = document.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    document.setPage(pageNumber);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.setTextColor(107, 114, 128);
    document.text(
      `Página ${pageNumber} de ${totalPages}`,
      document.internal.pageSize.getWidth() / 2,
      document.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }

  document.save(fileName);
}
