import axios from 'axios';
import * as XLSX from 'xlsx';
import { apiClient } from '../../../api/axios';
import {
  createPersonaConstanciaPdf,
  type ConstanciaPdfAttendanceRow,
} from '../../../shared/utils/exportPersonaConstanciaPdf';
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

type AttendanceEventType = 'FAENA' | 'ASAMBLEA';
type ConstanciaAttendance = Record<AttendanceEventType, PersonaAsistenciaFicha[]>;

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

async function collectConstanciaAttendance(
  tenantId: string | number,
  personaId: string | number,
  tipo: AttendanceEventType,
): Promise<PersonaAsistenciaFicha[]> {
  const items: PersonaAsistenciaFicha[] = [];
  const ids = new Set<string>();
  const incomplete = () => new Error('No se pudo cargar el historial completo de asistencias. Vuelve a intentarlo.');
  let total: number | undefined;

  for (let page = 1; ; page += 1) {
    const response = await getPersonaFichaAsistencias(tenantId, personaId, {
      tipo,
      page,
      limit: EXPORT_PAGE_SIZE,
    });
    total ??= response.total;

    if (response.page !== page || response.total !== total || items.length + response.items.length > total) {
      throw incomplete();
    }

    for (const item of response.items) {
      const id = String(item.idAsistencia);
      if (item.tipoEvento !== tipo || ids.has(id)) {
        throw incomplete();
      }
      ids.add(id);
      items.push(item);
    }

    if (items.length === total) {
      return items;
    }
    if (response.items.length < EXPORT_PAGE_SIZE) {
      throw incomplete();
    }
  }
}

export async function getPersonaConstanciaAttendance(
  tenantId: string | number,
  personaId: string | number,
): Promise<ConstanciaAttendance> {
  const [faenas, asambleas] = await Promise.all([
    collectConstanciaAttendance(tenantId, personaId, 'FAENA'),
    collectConstanciaAttendance(tenantId, personaId, 'ASAMBLEA'),
  ]);

  return { FAENA: faenas, ASAMBLEA: asambleas };
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

function formatCalendarDate(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(value);
  return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : formatDate(value);
}

function toPdfAttendanceRows(items: PersonaAsistenciaFicha[], tipo: AttendanceEventType) {
  const rows: ConstanciaPdfAttendanceRow[] = [];

  for (const { estado, fecha, nombreEvento } of items) {
    if (estado === 'ASISTIO' || estado === 'TARDE' || estado === 'FALTO' || estado === 'JUSTIFICADO') {
      rows.push({
        fecha: tipo === 'FAENA' ? formatCalendarDate(fecha) : formatDate(fecha),
        evento: nombreEvento,
        estado,
      });
    }
  }

  return rows;
}

export function buildPersonaConstanciaPdf(
  constancia: PersonaConstanciaIssued,
  asistencias: ConstanciaAttendance,
) {
  const { persona, tenant } = constancia.snapshot;

  return createPersonaConstanciaPdf({
    organizacion: tenant.nombre,
    documentoOrganizacion: [tenant.tipoDocumento, tenant.numeroDocumento].filter(Boolean).join(' '),
    codigo: constancia.codigo,
    fechaEmision: formatDate(constancia.issuedAt, true),
    persona: {
      nombre: persona.nombreCompleto,
      dni: persona.dni || 'No registrado',
      padron: String(persona.nroPadron ?? 'No registrado'),
      fechaRegistro: formatCalendarDate(persona.fechaRegistro),
      tipo: persona.tipoParticipante.replace(/_/g, ' '),
      estado: persona.estado,
    },
    verificationUrl: constancia.verificationUrl,
    snapshotHash: constancia.snapshotHash,
    faenas: toPdfAttendanceRows(asistencias.FAENA, 'FAENA'),
    asambleas: toPdfAttendanceRows(asistencias.ASAMBLEA, 'ASAMBLEA'),
  });
}

export async function exportPersonaConstanciaToPdf(
  constancia: PersonaConstanciaIssued,
  asistencias: ConstanciaAttendance,
) {
  const document = await buildPersonaConstanciaPdf(constancia, asistencias);
  const personSlug = slugify(constancia.snapshot.persona.nombreCompleto).slice(0, 100).replace(/-$/, '');
  document.save(`constancia-${personSlug}-${constancia.codigo}.pdf`);
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
