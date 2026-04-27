import { exportExcel, type ExportCell } from '../../../../shared/utils/exportExcel';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { JuntaDirectiva } from '../../../juntasDirectivas/types';
import type { RendicionCuentasResponse } from '../types';

type ExportMetadata = {
  tenantName: string;
  junta: JuntaDirectiva;
  generatedAt?: Date;
};

type PdfRow = string[];

const detalleColumns = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Medio de pago', 'Documento'];
const pdfMarginX = 14;
const pdfPageWidth = 210;

function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'junta'
  );
}

function getReportDate(generatedAt?: Date) {
  return (generatedAt ?? new Date()).toLocaleDateString();
}

function formatDate(value: string) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    style: 'currency',
  }).format(value);
}

function getTipoLabel(value: 'INGRESO' | 'GASTO') {
  return value === 'INGRESO' ? 'Ingreso' : 'Egreso';
}

function getMedioPagoLabel(value: string) {
  const labels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    YAPE: 'Yape',
    PLIN: 'Plin',
    OTRO: 'Otro',
  };

  return labels[value] ?? value;
}

function getPeriodoLabel(report: RendicionCuentasResponse) {
  const inicio = formatDate(report.periodo.fechaInicio);
  const fin = formatDate(report.periodo.fechaFin);

  return `${inicio} - ${fin}`;
}

function getFileBaseName(metadata: ExportMetadata) {
  const juntaName = metadata.junta.nombre?.trim() || `junta-${metadata.junta.idJunta}`;
  const today = new Date().toISOString().slice(0, 10);

  return `rendicion-cuentas-${slugify(juntaName)}-${today}`;
}

function buildMetadataRows(report: RendicionCuentasResponse, metadata: ExportMetadata) {
  const tenantName = metadata.tenantName.trim() || 'Junta activa';
  const juntaName = metadata.junta.nombre?.trim() || `Junta #${metadata.junta.idJunta}`;

  return [
    `Tenant: ${tenantName}`,
    `Junta directiva: ${juntaName}`,
    `Periodo: ${getPeriodoLabel(report)}`,
    `Fecha de generación: ${getReportDate(metadata.generatedAt)}`,
  ];
}

function buildResumenRows(report: RendicionCuentasResponse): ExportCell[][] {
  return [
    ['Saldo inicial', formatCurrency(report.resumen.saldoInicial)],
    ['Total ingresos', formatCurrency(report.resumen.totalIngresos)],
    ['Total egresos', formatCurrency(report.resumen.totalGastos)],
    ['Saldo final', formatCurrency(report.resumen.saldoFinal)],
  ];
}

function buildCategoriaRows(report: RendicionCuentasResponse): ExportCell[][] {
  return report.porCategoria.map((categoria) => [
    getTipoLabel(categoria.tipo),
    categoria.categoria || 'Sin categoría',
    formatCurrency(categoria.total),
  ]);
}

function buildDetalleRows(report: RendicionCuentasResponse): ExportCell[][] {
  return report.detalleMovimientos.map((movimiento) => [
    formatDate(movimiento.fecha),
    getTipoLabel(movimiento.tipo),
    movimiento.categoria || 'Sin categoría',
    movimiento.descripcion || 'Sin descripción',
    formatCurrency(movimiento.monto),
    getMedioPagoLabel(movimiento.medioPago),
    movimiento.docReferencia ?? '',
  ]);
}

function parseDateTime(value: string) {
  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

function toPdfRows(rows: ExportCell[][]): PdfRow[] {
  return rows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) {
        return '';
      }

      return String(cell);
    }),
  );
}

function buildCategoriaPdfRows(report: RendicionCuentasResponse): PdfRow[] {
  const categoryMap = new Map<string, { categoria: string; ingresos: number; egresos: number }>();

  report.porCategoria.forEach((item) => {
    const categoria = item.categoria || 'Sin categoría';
    const current = categoryMap.get(categoria) ?? { categoria, ingresos: 0, egresos: 0 };

    if (item.tipo === 'INGRESO') {
      current.ingresos += item.total;
    } else {
      current.egresos += item.total;
    }

    categoryMap.set(categoria, current);
  });

  const rows = Array.from(categoryMap.values())
    .sort((left, right) => {
      const leftTypeOrder = left.ingresos > 0 && left.egresos === 0 ? 0 : 1;
      const rightTypeOrder = right.ingresos > 0 && right.egresos === 0 ? 0 : 1;

      if (leftTypeOrder !== rightTypeOrder) {
        return leftTypeOrder - rightTypeOrder;
      }

      return left.categoria.localeCompare(right.categoria);
    })
    .map((item) => [
      item.categoria,
      item.ingresos > 0 ? formatCurrency(item.ingresos) : '',
      item.egresos > 0 ? formatCurrency(item.egresos) : '',
      formatCurrency(item.ingresos - item.egresos),
    ]);
  const totalIngresos = report.porCategoria
    .filter((categoria) => categoria.tipo === 'INGRESO')
    .reduce((sum, categoria) => sum + categoria.total, 0);
  const totalEgresos = report.porCategoria
    .filter((categoria) => categoria.tipo === 'GASTO')
    .reduce((sum, categoria) => sum + categoria.total, 0);

  return [
    ...(rows.length > 0 ? rows : [['Sin movimientos por categoría', '', '', formatCurrency(0)]]),
    ['Totales', formatCurrency(totalIngresos), formatCurrency(totalEgresos), ''],
    ['Resultado general', '', '', formatCurrency(totalIngresos - totalEgresos)],
  ];
}

function buildDetallePdfRows(report: RendicionCuentasResponse): PdfRow[] {
  const sortedMovimientos = [...report.detalleMovimientos].sort(
    (left, right) => parseDateTime(left.fecha) - parseDateTime(right.fecha),
  );
  const rows = sortedMovimientos.map((movimiento) => [
    formatDate(movimiento.fecha),
    movimiento.categoria || 'Sin categoría',
    movimiento.descripcion || 'Sin descripción',
    movimiento.tipo === 'INGRESO' ? formatCurrency(movimiento.monto) : '',
    movimiento.tipo === 'GASTO' ? formatCurrency(movimiento.monto) : '',
    getMedioPagoLabel(movimiento.medioPago),
    movimiento.docReferencia ?? '',
  ]);
  const totalIngresos = sortedMovimientos
    .filter((movimiento) => movimiento.tipo === 'INGRESO')
    .reduce((sum, movimiento) => sum + movimiento.monto, 0);
  const totalEgresos = sortedMovimientos
    .filter((movimiento) => movimiento.tipo === 'GASTO')
    .reduce((sum, movimiento) => sum + movimiento.monto, 0);

  return [
    ...(rows.length > 0 ? rows : [['Sin movimientos', '', '', formatCurrency(0), formatCurrency(0), '', '']]),
    ['', '', 'Total movimientos', formatCurrency(totalIngresos), formatCurrency(totalEgresos), '', ''],
  ];
}

function buildExcelRows(report: RendicionCuentasResponse): ExportCell[][] {
  const resumenRows = buildResumenRows(report);
  const categoriaRows = buildCategoriaRows(report);
  const detalleRows = buildDetalleRows(report);

  return [
    ['Resumen'],
    ['Concepto', 'Monto'],
    ...resumenRows,
    [],
    ['Totales por categoría'],
    ['Tipo', 'Categoría', 'Total'],
    ...(categoriaRows.length > 0 ? categoriaRows : [['Sin movimientos por categoría', '', '']]),
    [],
    ['Detalle de movimientos'],
    detalleColumns,
    ...(detalleRows.length > 0 ? detalleRows : [['Sin movimientos', '', '', '', '', '', '']]),
  ];
}

function addReportHeader(document: jsPDF, report: RendicionCuentasResponse, metadata: ExportMetadata) {
  const tenantName = metadata.tenantName.trim() || 'Junta activa';
  const juntaName = metadata.junta.nombre?.trim() || `Junta #${metadata.junta.idJunta}`;

  document.setTextColor(17, 24, 39);
  document.setFont('helvetica', 'bold');
  document.setFontSize(17);
  document.text('Rendición de cuentas', pdfMarginX, 16);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.setTextColor(75, 85, 99);
  document.text('Reporte financiero de caja por junta directiva', pdfMarginX, 23);

  document.setTextColor(17, 24, 39);
  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.text(tenantName, pdfMarginX, 35);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.setTextColor(75, 85, 99);
  document.text(`Junta directiva: ${juntaName}`, pdfMarginX, 41);
  document.text(`Periodo: ${getPeriodoLabel(report)}`, pdfMarginX, 46);
  document.text(`Fecha de generación: ${getReportDate(metadata.generatedAt)}`, pdfMarginX, 51);
  document.setDrawColor(226, 232, 240);
  document.line(pdfMarginX, 58, pdfPageWidth - pdfMarginX, 58);
}

function getTableEndY(document: jsPDF) {
  const lastAutoTable = (document as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;

  return lastAutoTable?.finalY ?? 96;
}

function addSectionTitle(document: jsPDF, title: string, y: number) {
  document.setFont('helvetica', 'bold');
  document.setFontSize(11);
  document.setTextColor(17, 24, 39);
  document.text(title, pdfMarginX, y);
}

function addPageFooters(document: jsPDF) {
  const totalPages = document.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    document.setPage(pageNumber);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8.5);
    document.setTextColor(107, 114, 128);
    document.text(
      `Página ${pageNumber} de ${totalPages}`,
      document.internal.pageSize.getWidth() / 2,
      document.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }
}

function renderResumenTable(document: jsPDF, report: RendicionCuentasResponse, startY: number) {
  const resumenRows = toPdfRows(buildResumenRows(report));

  addSectionTitle(document, '1. Resumen financiero', startY);
  autoTable(document, {
    head: [['Concepto', 'Monto']],
    body: resumenRows,
    startY: startY + 4,
    margin: { left: pdfMarginX, right: pdfMarginX },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.4,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
}

function renderCategoriasTable(document: jsPDF, report: RendicionCuentasResponse, startY: number) {
  const categoriaRows = buildCategoriaPdfRows(report);

  addSectionTitle(document, '2. Totales por categoría', startY);
  autoTable(document, {
    head: [['Categoría', 'Ingresos', 'Egresos', 'Saldo']],
    body: categoriaRows,
    startY: startY + 4,
    margin: { left: pdfMarginX, right: pdfMarginX },
    styles: {
      font: 'helvetica',
      fontSize: 8.8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 86 },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') {
        return;
      }

      const rawRow = data.row.raw as PdfRow;
      const firstCell = rawRow[0] ?? '';

      if (firstCell === 'Totales' || firstCell === 'Resultado general') {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
}

function renderDetalleTable(document: jsPDF, report: RendicionCuentasResponse, startY: number) {
  const detalleRows = buildDetallePdfRows(report);

  addSectionTitle(document, '3. Detalle de movimientos', startY);
  autoTable(document, {
    head: [['Fecha', 'Categoría', 'Descripción', 'Ingreso', 'Egreso', 'Medio', 'Documento']],
    body: detalleRows,
    startY: startY + 4,
    margin: { left: pdfMarginX, right: pdfMarginX },
    styles: {
      font: 'helvetica',
      fontSize: 7.6,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 19 },
      1: { cellWidth: 27 },
      2: { cellWidth: 50 },
      3: { cellWidth: 23, halign: 'right' },
      4: { cellWidth: 23, halign: 'right' },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') {
        return;
      }

      const rawRow = data.row.raw as PdfRow;
      const conceptoCell = rawRow[2] ?? '';

      if (conceptoCell === 'Total movimientos') {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
}

export function exportRendicionCuentasToExcel(
  report: RendicionCuentasResponse,
  metadata: ExportMetadata,
) {
  exportExcel({
    fileName: `${getFileBaseName(metadata)}.xlsx`,
    sheetName: 'Rendición',
    columns: [],
    rows: buildExcelRows(report),
    titleRows: [['Rendición de cuentas'], ...buildMetadataRows(report, metadata).map((row) => [row])],
    columnWidths: [18, 18, 24, 42, 18, 18, 22],
  });
}

export function exportRendicionCuentasToPdf(
  report: RendicionCuentasResponse,
  metadata: ExportMetadata,
) {
  const document = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  addReportHeader(document, report, metadata);
  renderResumenTable(document, report, 68);
  renderCategoriasTable(document, report, getTableEndY(document) + 12);
  renderDetalleTable(document, report, getTableEndY(document) + 12);
  addPageFooters(document);
  document.save(`${getFileBaseName(metadata)}.pdf`);
}
