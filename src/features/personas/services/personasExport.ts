import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ListQuery, Persona } from '../types';
import { getPersonas } from './personasApi';

type ExportMetadata = {
  tenantName: string;
  generatedAt?: Date;
};

function getApellidosYNombres(persona: Persona) {
  const toUpperCase = (value: string) => value.trim().toUpperCase();
  const toPascalCase = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const apellidoPaterno = toUpperCase(persona.apellidoPaterno);
  const apellidoMaterno = toUpperCase(persona.apellidoMaterno);
  const nombres = toPascalCase(persona.nombres);
  const apellidos = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');

  if (apellidos && nombres) {
    return `${apellidos}, ${nombres}`;
  }

  return apellidos || nombres;
}

function toSortableNumber(value: string | number) {
  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return null;
}

function sortPersonasForExport(personas: Persona[]) {
  return [...personas].sort((left, right) => {
    const leftNumber = toSortableNumber(left.idPersona);
    const rightNumber = toSortableNumber(right.idPersona);

    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber - rightNumber;
    }

    return String(left.idPersona).localeCompare(String(right.idPersona));
  });
}

function buildExportRows(personas: Persona[]) {
  return sortPersonasForExport(personas).map((persona, index) => [
    index + 1,
    getApellidosYNombres(persona),
    persona.dni ?? '',
    persona.telefono ?? '',
    persona.tipoParticipante,
  ]);
}

function getReportDate(generatedAt?: Date) {
  return (generatedAt ?? new Date()).toLocaleDateString();
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'junta-activa';
}

export async function getPersonasForExport(
  tenantId: string,
  query: Omit<ListQuery, 'page' | 'pageSize'>,
): Promise<Persona[]> {
  const allRows: Persona[] = [];
  const batchSize = 100;

  for (let currentPage = 1; currentPage <= 500; currentPage += 1) {
    const response = await getPersonas(tenantId, {
      ...query,
      page: currentPage,
      pageSize: batchSize,
    });

    if (response.items.length === 0) {
      break;
    }

    allRows.push(...response.items);

    if (response.items.length < batchSize || allRows.length >= response.total) {
      break;
    }
  }

  return allRows;
}

export function exportPersonasToExcel(personas: Persona[], metadata: ExportMetadata) {
  const tenantName = metadata.tenantName.trim() || 'Junta activa';
  const generatedAt = getReportDate(metadata.generatedAt);
  const rows = buildExportRows(personas);
  const sheetData: Array<Array<string | number>> = [
    ['Relación de socios de la asociación'],
    [`Junta: ${tenantName}`],
    [`Fecha: ${generatedAt}`],
    [],
    ['Nro', 'Apellidos y nombres', 'DNI', 'Teléfono', 'Tipo participante'],
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 42 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Socios');
  XLSX.writeFile(workbook, `relacion-socios-${slugify(tenantName)}.xlsx`);
}

export function exportPersonasToPdf(personas: Persona[], metadata: ExportMetadata) {
  const tenantName = metadata.tenantName.trim() || 'Junta activa';
  const generatedAt = getReportDate(metadata.generatedAt);
  const rows = buildExportRows(personas);
  const document = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  document.setFont('helvetica', 'bold');
  document.setFontSize(16);
  document.text('Relación de socios de la asociación', 14, 18);

  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.text(`Junta: ${tenantName}`, 14, 25);
  document.text(`Fecha: ${generatedAt}`, 14, 30);

  autoTable(document, {
    head: [['Nro', 'Apellidos y nombres', 'DNI', 'Teléfono', 'Tipo participante']],
    body: rows,
    startY: 36,
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
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 72 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 34 },
    },
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

  document.save(`relacion-socios-${slugify(tenantName)}.pdf`);
}
