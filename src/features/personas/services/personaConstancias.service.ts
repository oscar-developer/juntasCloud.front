import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { apiClient } from '../../../api/axios';
import type {
  PersonaAsistenciaFicha,
  PersonaConstanciaIssued,
  PersonaConstanciaVerification,
  PersonaFichaExportData,
  PersonaFichaPaginatedResponse,
  PersonaObligacionFicha,
  PersonaPagoFicha,
} from '../types';
import {
  getPersonaById,
  getPersonaFichaAsistencias,
  getPersonaFichaObligaciones,
  getPersonaFichaPagos,
  getPersonaFichaTerrenos,
} from './personas.service';

const EXPORT_PAGE_SIZE = 100;

function resolveApiPath(path: string) {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    return /(?:^|\/)api(?:\/|$)/.test(pathname) ? path : `/api${path}`;
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? path : `/api${path}`;
  }
}

function tenantConfig(tenantId: string | number) {
  return { headers: { 'X-Tenant-Id': String(tenantId) } };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      return 'No tienes permisos para emitir constancias.';
    }

    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const candidate = data as { message?: string | string[]; error?: string };
      if (Array.isArray(candidate.message)) {
        return candidate.message.join(' ');
      }
      if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message;
      }
      if (typeof candidate.error === 'string' && candidate.error.trim()) {
        return candidate.error;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo completar la operacion de la constancia.';
}

export async function issuePersonaConstancia(
  tenantId: string | number,
  personaId: string | number,
): Promise<PersonaConstanciaIssued> {
  try {
    const response = await apiClient.post<PersonaConstanciaIssued>(
      resolveApiPath(`/personas/${personaId}/constancias`),
      {},
      tenantConfig(tenantId),
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function verifyPersonaConstancia(
  token: string,
  signal?: AbortSignal,
): Promise<PersonaConstanciaVerification> {
  try {
    const response = await apiClient.get<PersonaConstanciaVerification>(
      resolveApiPath(`/persona-constancias/verificar/${encodeURIComponent(token)}`),
      { signal },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('No se encontro una constancia asociada a este codigo de verificacion.');
    }
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('No se pudo conectar con el servicio de verificacion.');
    }
    throw new Error(getErrorMessage(error));
  }
}

async function collectPages<T>(
  loader: (page: number) => Promise<PersonaFichaPaginatedResponse<T>>,
): Promise<T[]> {
  const items: T[] = [];

  for (let page = 1; page <= 500; page += 1) {
    const response = await loader(page);
    items.push(...response.items);

    if (response.items.length === 0 || response.items.length < EXPORT_PAGE_SIZE || items.length >= response.total) {
      break;
    }
  }

  return items;
}

export async function getPersonaFichaExportData(
  tenantId: string | number,
  personaId: string | number,
): Promise<PersonaFichaExportData> {
  const [persona, asistencias, obligaciones, pagos, terrenos] = await Promise.all([
    getPersonaById(tenantId, personaId),
    collectPages<PersonaAsistenciaFicha>((page) =>
      getPersonaFichaAsistencias(tenantId, personaId, { page, limit: EXPORT_PAGE_SIZE }),
    ),
    collectPages<PersonaObligacionFicha>((page) =>
      getPersonaFichaObligaciones(tenantId, personaId, { page, limit: EXPORT_PAGE_SIZE }),
    ),
    collectPages<PersonaPagoFicha>((page) =>
      getPersonaFichaPagos(tenantId, personaId, { page, limit: EXPORT_PAGE_SIZE }),
    ),
    getPersonaFichaTerrenos(tenantId, personaId),
  ]);

  return { persona, asistencias, obligaciones, pagos, terrenos };
}

function formatDate(value?: string | null, includeTime = false) {
  if (!value) {
    return 'No registrado';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value ?? 0);
}

function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'persona'
  );
}

function attendanceLabel(summary: PersonaConstanciaIssued['snapshot']['resumen']['faenas']) {
  return `${summary.asistencias + summary.tardanzas} de ${summary.total} (${Math.round(summary.porcentajeAsistencia)}%)`;
}

export async function buildPersonaConstanciaPdf(constancia: PersonaConstanciaIssued) {
  const document = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const { snapshot } = constancia;
  const pageWidth = document.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const qrDataUrl = await QRCode.toDataURL(constancia.verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
  });

  document.setFillColor(22, 101, 52);
  document.rect(0, 0, pageWidth, 9, 'F');
  document.setTextColor(17, 24, 39);
  document.setFont('helvetica', 'bold');
  document.setFontSize(16);
  document.text(snapshot.tenant.nombre, pageWidth / 2, 20, { align: 'center', maxWidth: contentWidth });
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.setTextColor(75, 85, 99);
  const tenantDocument = [snapshot.tenant.tipoDocumento, snapshot.tenant.numeroDocumento].filter(Boolean).join(' ');
  document.text(tenantDocument || 'Organización comunal', pageWidth / 2, 26, { align: 'center' });
  document.setDrawColor(203, 213, 225);
  document.line(margin, 32, pageWidth - margin, 32);

  document.setTextColor(17, 24, 39);
  document.setFont('helvetica', 'bold');
  document.setFontSize(15);
  document.text('CONSTANCIA DE REGISTRO Y CONDICIÓN', pageWidth / 2, 43, { align: 'center' });
  document.setFontSize(9);
  document.setFont('helvetica', 'normal');
  document.setTextColor(75, 85, 99);
  document.text(`Código: ${constancia.codigo}`, margin, 52);
  document.text(`Fecha de emisión: ${formatDate(constancia.issuedAt, true)}`, pageWidth - margin, 52, {
    align: 'right',
  });

  document.setTextColor(31, 41, 55);
  document.setFontSize(10.5);
  const statement =
    `La ${snapshot.tenant.nombre} deja constancia que ${snapshot.persona.nombreCompleto}, ` +
    `identificado(a) con DNI ${snapshot.persona.dni || 'no registrado'}, figura en el registro institucional ` +
    `como ${snapshot.persona.tipoParticipante.replace(/_/g, ' ').toLowerCase()}, ` +
    `${snapshot.persona.nroPadron ? `con padrón Nro. ${snapshot.persona.nroPadron}, ` : ''}` +
    `en condición ${snapshot.persona.estado.toLowerCase()} a la fecha de emisión del presente documento.`;
  const statementLines = document.splitTextToSize(statement, contentWidth);
  document.text(statementLines, margin, 64, { lineHeightFactor: 1.45 });

  document.setFillColor(248, 250, 252);
  document.setDrawColor(226, 232, 240);
  document.roundedRect(margin, 92, contentWidth, 43, 2, 2, 'FD');
  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.setTextColor(17, 24, 39);
  document.text('Datos de registro', margin + 5, 101);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.text(`Nombre completo: ${snapshot.persona.nombreCompleto}`, margin + 5, 109, { maxWidth: contentWidth - 10 });
  document.text(`DNI: ${snapshot.persona.dni || 'No registrado'}`, margin + 5, 116);
  document.text(`Padrón: ${snapshot.persona.nroPadron ?? 'No registrado'}`, margin + 70, 116);
  document.text(`Fecha de registro: ${formatDate(snapshot.persona.fechaRegistro)}`, margin + 5, 123);
  document.text(`Estado: ${snapshot.persona.estado}`, margin + 70, 123);
  document.text(`Tipo: ${snapshot.persona.tipoParticipante.replace(/_/g, ' ')}`, margin + 5, 130);

  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.text('Resumen informativo al momento de emisión', margin, 147);
  const metrics = [
    ['Deuda pendiente', formatMoney(snapshot.resumen.deudaPendienteTotal)],
    ['Asistencia a faenas', attendanceLabel(snapshot.resumen.faenas)],
    ['Asistencia a asambleas', attendanceLabel(snapshot.resumen.asambleas)],
    ['Terrenos relacionados', String(snapshot.resumen.totalTerrenos)],
  ];
  metrics.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * (contentWidth / 2);
    const y = 157 + row * 14;
    document.setFont('helvetica', 'normal');
    document.setFontSize(8.5);
    document.setTextColor(100, 116, 139);
    document.text(label, x, y);
    document.setFont('helvetica', 'bold');
    document.setFontSize(10);
    document.setTextColor(17, 24, 39);
    document.text(value, x, y + 5);
  });

  document.addImage(qrDataUrl, 'PNG', pageWidth - margin - 34, 188, 34, 34);
  document.setFont('helvetica', 'bold');
  document.setFontSize(9.5);
  document.setTextColor(17, 24, 39);
  document.text('Verificación pública', margin, 194);
  document.setFont('helvetica', 'normal');
  document.setFontSize(8.5);
  document.setTextColor(75, 85, 99);
  const verificationText = document.splitTextToSize(
    `Escanee el código QR o visite el siguiente enlace para comprobar la autenticidad y vigencia de esta constancia: ${constancia.verificationUrl}`,
    contentWidth - 44,
  );
  document.text(verificationText, margin, 201, { lineHeightFactor: 1.35 });
  document.setFontSize(7.5);
  document.text(`Huella: ${constancia.snapshotHash}`, margin, 222, { maxWidth: contentWidth - 44 });

  const signerWidth = contentWidth / 3;
  const signatureY = 258;
  snapshot.firmantes.forEach((signer, index) => {
    const centerX = margin + signerWidth * index + signerWidth / 2;
    document.setDrawColor(100, 116, 139);
    document.line(centerX - 23, signatureY, centerX + 23, signatureY);
    document.setTextColor(17, 24, 39);
    document.setFont('helvetica', 'bold');
    document.setFontSize(8.5);
    document.text(signer.nombreCompleto || ' ', centerX, signatureY + 5, { align: 'center', maxWidth: 48 });
    document.setFont('helvetica', 'normal');
    document.setTextColor(75, 85, 99);
    document.text(signer.cargo.charAt(0) + signer.cargo.slice(1).toLowerCase(), centerX, signatureY + 10, {
      align: 'center',
    });
    document.text('Firma y sello', centerX, signatureY + 14, { align: 'center' });
  });

  document.setFont('helvetica', 'normal');
  document.setFontSize(7.5);
  document.setTextColor(100, 116, 139);
  document.text(
    'Documento generado por el sistema. Su autenticidad se confirma exclusivamente mediante el enlace de verificación.',
    pageWidth / 2,
    289,
    { align: 'center', maxWidth: contentWidth },
  );

  return document;
}

export async function exportPersonaConstanciaToPdf(constancia: PersonaConstanciaIssued) {
  const document = await buildPersonaConstanciaPdf(constancia);
  document.save(
    `constancia-${slugify(constancia.snapshot.persona.nombreCompleto)}-${constancia.codigo}.pdf`,
  );
}

function createSheet(rows: Array<Array<string | number | boolean | null | undefined>>, widths: number[]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = widths.map((wch) => ({ wch }));
  return sheet;
}

export function exportPersonaFichaToExcel(
  constancia: PersonaConstanciaIssued,
  data: PersonaFichaExportData,
) {
  const { snapshot } = constancia;
  const workbook = XLSX.utils.book_new();
  const summaryRows = [
    ['FICHA DE PERSONA - ANEXO INFORMATIVO'],
    ['Junta', snapshot.tenant.nombre],
    ['Codigo de constancia', constancia.codigo],
    ['Fecha de generacion', formatDate(constancia.issuedAt, true)],
    ['Enlace de verificacion', constancia.verificationUrl],
    ['Aviso', 'La verificacion publica acredita la constancia de registro y condicion, no los movimientos posteriores.'],
    [],
    ['DATOS PERSONALES'],
    ['Nombre completo', snapshot.persona.nombreCompleto],
    ['DNI', snapshot.persona.dni ?? ''],
    ['Padron', snapshot.persona.nroPadron ?? ''],
    ['Tipo participante', snapshot.persona.tipoParticipante],
    ['Estado', snapshot.persona.estado],
    ['Fecha de registro', formatDate(snapshot.persona.fechaRegistro)],
    ['Correo', data.persona.email ?? ''],
    ['Telefono', data.persona.telefono ?? ''],
    ['Direccion', data.persona.direccion ?? ''],
    ['Referencia', data.persona.referenciaVivienda ?? ''],
    [],
    ['RESUMEN'],
    ['Deuda pendiente', snapshot.resumen.deudaPendienteTotal],
    ['Asistencia faenas', attendanceLabel(snapshot.resumen.faenas)],
    ['Asistencia asambleas', attendanceLabel(snapshot.resumen.asambleas)],
    ['Terrenos relacionados', snapshot.resumen.totalTerrenos],
  ];
  XLSX.utils.book_append_sheet(workbook, createSheet(summaryRows, [28, 90]), 'Resumen');

  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(
      [
        ['Tipo', 'Fecha', 'Evento', 'Estado', 'Hora llegada', 'Observacion', 'Multa', 'Monto multa'],
        ...data.asistencias.map((item) => [
          item.tipoEvento,
          formatDate(item.fecha),
          item.nombreEvento,
          item.estado,
          item.horaLlegada ?? '',
          item.observacion ?? '',
          item.multaGenerada ? 'Si' : 'No',
          item.montoMulta ?? 0,
        ]),
      ],
      [14, 14, 38, 16, 15, 42, 12, 16],
    ),
    'Asistencias',
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(
      [
        ['Fecha', 'Concepto', 'Descripcion', 'Importe original', 'Saldo pendiente', 'Estado', 'Origen', 'Vencimiento'],
        ...data.obligaciones.map((item) => [
          formatDate(item.fecha),
          item.concepto,
          item.descripcion ?? '',
          item.importeOriginal,
          item.saldoPendiente,
          item.estado,
          item.origen,
          formatDate(item.fechaVencimiento),
        ]),
      ],
      [14, 30, 42, 18, 18, 16, 18, 14],
    ),
    'Obligaciones',
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(
      [
        ['Fecha', 'Concepto', 'Importe', 'Medio de pago', 'Referencia', 'Descripcion', 'Estado'],
        ...data.pagos.map((item) => [
          formatDate(item.fecha),
          item.concepto,
          item.importe,
          item.medioPago,
          item.referencia ?? '',
          item.descripcion ?? '',
          item.estado,
        ]),
      ],
      [14, 32, 16, 18, 20, 42, 16],
    ),
    'Pagos',
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createSheet(
      [
        ['Codigo lote', 'Manzana', 'Numero lote', 'Descripcion', 'Area aprox. m2', 'Area legal m2', 'Ubicacion', 'Relacion', 'Estado'],
        ...data.terrenos.map((item) => [
          item.codigoLote ?? '',
          item.manzana ?? '',
          item.numeroLote ?? '',
          item.descripcion,
          item.areaAproxM2 ?? '',
          item.areaLegalM2 ?? '',
          item.ubicacion ?? '',
          item.tipoRelacion,
          item.estado,
        ]),
      ],
      [18, 12, 14, 36, 16, 16, 36, 18, 16],
    ),
    'Terrenos',
  );

  XLSX.writeFile(
    workbook,
    `ficha-${slugify(snapshot.persona.nombreCompleto)}-${constancia.codigo}.xlsx`,
  );
}
