import { exportExcel } from '../../../shared/utils/exportExcel';
import { exportPdf } from '../../../shared/utils/exportPdf';
import type { ListQuery, Persona } from '../types';
import { getPersonas } from './personas.service';

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
    const leftPadron = left.nroPadron ?? null;
    const rightPadron = right.nroPadron ?? null;

    if (leftPadron !== null && rightPadron !== null && leftPadron !== rightPadron) {
      return leftPadron - rightPadron;
    }

    if (leftPadron !== null && rightPadron === null) {
      return -1;
    }

    if (leftPadron === null && rightPadron !== null) {
      return 1;
    }

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
    persona.nroPadron ?? '',
    getApellidosYNombres(persona),
    persona.dni ?? '',
    persona.telefono ?? '',
    persona.tipoParticipante,
  ]);
}

const exportColumns = ['Nro', 'Nro padrón', 'Apellidos y nombres', 'DNI', 'Teléfono', 'Tipo participante'];

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

  exportExcel({
    fileName: `relacion-socios-${slugify(tenantName)}.xlsx`,
    sheetName: 'Socios',
    columns: exportColumns,
    rows: buildExportRows(personas),
    titleRows: [
      ['Relación de socios de la asociación'],
      [`Junta: ${tenantName}`],
      [`Fecha: ${generatedAt}`],
    ],
    columnWidths: [8, 14, 42, 18, 18, 22],
  });
}

export function exportPersonasToPdf(personas: Persona[], metadata: ExportMetadata) {
  const tenantName = metadata.tenantName.trim() || 'Junta activa';
  const generatedAt = getReportDate(metadata.generatedAt);

  exportPdf({
    fileName: `relacion-socios-${slugify(tenantName)}.pdf`,
    title: 'Relación de socios de la asociación',
    metadataRows: [`Junta: ${tenantName}`, `Fecha: ${generatedAt}`],
    columns: exportColumns,
    rows: buildExportRows(personas),
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 18 },
      2: { cellWidth: 66 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 32 },
    },
  });
}
