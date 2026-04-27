import { exportExcel, type ExportCell } from '../../../../shared/utils/exportExcel';
import { exportPdf } from '../../../../shared/utils/exportPdf';
import type { JuntaDirectiva } from '../../../juntasDirectivas/types';
import type { RendicionCuentasResponse } from '../types';

type ExportMetadata = {
  tenantName: string;
  junta: JuntaDirectiva;
  generatedAt?: Date;
};

const detalleColumns = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Medio de pago', 'Documento'];

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

function buildPdfRows(report: RendicionCuentasResponse): ExportCell[][] {
  const rows: ExportCell[][] = [
    ['Resumen', '', '', '', '', '', ''],
    ...buildResumenRows(report).map((row) => [row[0], '', '', '', row[1], '', '']),
    ['', '', '', '', '', '', ''],
    ['Totales por categoría', '', '', '', '', '', ''],
  ];
  const categoriaRows = buildCategoriaRows(report);

  rows.push(
    ...(categoriaRows.length > 0
      ? categoriaRows.map((row) => [row[0], '', row[1], '', row[2], '', ''])
      : [['Sin movimientos por categoría', '', '', '', '', '', '']]),
    ['', '', '', '', '', '', ''],
    ['Detalle de movimientos', '', '', '', '', '', ''],
    ...(buildDetalleRows(report).length > 0
      ? buildDetalleRows(report)
      : [['Sin movimientos', '', '', '', '', '', '']]),
  );

  return rows;
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
  exportPdf({
    fileName: `${getFileBaseName(metadata)}.pdf`,
    title: 'Rendición de cuentas',
    metadataRows: buildMetadataRows(report, metadata),
    columns: detalleColumns,
    rows: buildPdfRows(report),
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 28 },
      3: { cellWidth: 45 },
      4: { cellWidth: 24 },
      5: { cellWidth: 24 },
      6: { cellWidth: 24 },
    },
  });
}
