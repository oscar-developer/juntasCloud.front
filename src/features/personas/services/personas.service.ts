import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  ListQuery,
  Persona,
  PersonaAsistenciaFicha,
  PersonaCreateDto,
  PersonaFichaAsistenciasQuery,
  PersonaFichaObligacionesQuery,
  PersonaFichaPaginatedResponse,
  PersonaFichaPagosQuery,
  PersonaFichaResumen,
  PersonaObligacionFicha,
  PersonaPagoFicha,
  PersonasListResponse,
  PersonaTerrenoFicha,
  PersonaUpdateDto,
} from '../types';

type PersonaApiShape = {
  idPersona?: number | string;
  id_persona?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  nombres?: string;
  apellidoPaterno?: string;
  apellido_paterno?: string;
  apellidoMaterno?: string;
  apellido_materno?: string;
  dni?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  referenciaVivienda?: string | null;
  referencia_vivienda?: string | null;
  tipoParticipante?: 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';
  tipo_participante?: 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';
  nroPadron?: number | null;
  nro_padron?: number | null;
  estado?: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO' | 'FALLECIDO';
  fechaRegistro?: string;
  fecha_registro?: string;
  fechaBaja?: string | null;
  fecha_baja?: string | null;
  observaciones?: string | null;
};

type PersonasListEnvelope =
  | PersonaApiShape[]
  | {
      items?: PersonaApiShape[];
      data?: PersonaApiShape[] | { items?: PersonaApiShape[] };
      results?: PersonaApiShape[];
    };

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolvePersonasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/personas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/personas' : '/api/personas';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? '/personas' : '/api/personas';
  }
}

function createTenantConfig(
  tenantId: string | number,
  signal?: AbortSignal,
): TenantScopedConfig {
  return {
    headers: {
      'X-Tenant-Id': String(tenantId),
    },
    signal,
  };
}

const PERSONAS_BASE_PATH = resolvePersonasBasePath();

function fetchPersonas(
  tenantId: string | number,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<AxiosResponse<PersonasListEnvelope>> {
  return apiClient.get<PersonasListEnvelope>(PERSONAS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });
}

async function fetchPersonaById(
  tenantId: string | number,
  idPersona: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${PERSONAS_BASE_PATH}/${idPersona}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

async function postPersona(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(PERSONAS_BASE_PATH, payload, createTenantConfig(tenantId));
  return response.data;
}

async function patchPersona(
  tenantId: string | number,
  idPersona: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${PERSONAS_BASE_PATH}/${idPersona}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

async function deletePersonaRequest(tenantId: string | number, idPersona: string | number) {
  const response = await apiClient.delete(
    `${PERSONAS_BASE_PATH}/${idPersona}`,
    createTenantConfig(tenantId),
  );

  return response.data;
}

async function fetchPersonaFichaResource(
  tenantId: string | number,
  idPersona: string | number,
  resource: string,
  params?: Record<string, string | number | undefined>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${PERSONAS_BASE_PATH}/${idPersona}/${resource}`, {
    ...createTenantConfig(tenantId, signal),
    params,
  });

  return response.data;
}

function normalizePersona(raw: PersonaApiShape): Persona {
  return {
    idPersona: raw.idPersona ?? raw.id_persona ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    nombres: raw.nombres ?? '',
    apellidoPaterno: raw.apellidoPaterno ?? raw.apellido_paterno ?? '',
    apellidoMaterno: raw.apellidoMaterno ?? raw.apellido_materno ?? '',
    dni: raw.dni ?? null,
    email: raw.email ?? null,
    telefono: raw.telefono ?? null,
    direccion: raw.direccion ?? null,
    referenciaVivienda: raw.referenciaVivienda ?? raw.referencia_vivienda ?? null,
    tipoParticipante: raw.tipoParticipante ?? raw.tipo_participante ?? 'NO_PADRONADO',
    nroPadron: raw.nroPadron ?? raw.nro_padron ?? null,
    estado: raw.estado ?? 'ACTIVO',
    fechaRegistro: raw.fechaRegistro ?? raw.fecha_registro ?? '',
    fechaBaja: raw.fechaBaja ?? raw.fecha_baja ?? null,
    observaciones: raw.observaciones ?? null,
  };
}

function normalizeBasePayload(payload: Partial<PersonaCreateDto>) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('nombres', payload.nombres?.trim());
  assign('apellidoPaterno', payload.apellidoPaterno?.trim());
  assign('apellidoMaterno', payload.apellidoMaterno?.trim());
  assign('dni', payload.dni?.trim() || undefined);
  assign('email', payload.email?.trim() || undefined);
  assign('telefono', payload.telefono?.trim() || undefined);
  assign('direccion', payload.direccion?.trim() || undefined);
  assign('referenciaVivienda', payload.referenciaVivienda?.trim() || undefined);
  assign('tipoParticipante', payload.tipoParticipante);
  assign('fechaRegistro', payload.fechaRegistro);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function normalizeCreatePayload(payload: PersonaCreateDto) {
  return normalizeBasePayload(payload);
}

function normalizeUpdatePayload(payload: PersonaUpdateDto) {
  const normalizedPayload = normalizeBasePayload(payload);

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('estado', payload.estado);
  assign('fechaBaja', payload.fechaBaja === '' ? null : payload.fechaBaja);
  assign('nroPadron', payload.nroPadron);

  return normalizedPayload;
}

function extractItems(data: PersonasListEnvelope): PersonaApiShape[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (data.data && typeof data.data === 'object' && Array.isArray(data.data.items)) {
    return data.data.items;
  }

  return [];
}

function parseTotal(
  response: AxiosResponse<PersonasListEnvelope>,
  page: number,
  pageSize: number,
  length: number,
) {
  const totalHeader = response.headers['x-total-count'];
  const parsed = Number(totalHeader);

  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }

  if (length < pageSize) {
    return (page - 1) * pageSize + length;
  }

  return page * pageSize + 1;
}

function buildListParams(query: ListQuery) {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
  };

  const search = query.search?.trim();
  const dni = query.dni?.trim();

  if (search) {
    params.search = search;
  }

  if (dni) {
    params.dni = dni;
  }

  if (query.estado && query.estado !== 'TODOS') {
    params.estado = query.estado;
  }

  if (query.tipoParticipante && query.tipoParticipante !== 'TODOS') {
    params.tipoParticipante = query.tipoParticipante;
  }

  return params;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return normalizeNumber(value);
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function normalizeId(value: unknown): number | string {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  return '';
}

function normalizeNullableId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  return null;
}

function normalizeResumenAsistencia(raw: Record<string, unknown>) {
  return {
    total: normalizeNumber(raw.total),
    asistencias: normalizeNumber(raw.asistencias),
    faltas: normalizeNumber(raw.faltas),
    tardanzas: normalizeNumber(raw.tardanzas),
    porcentajeAsistencia: normalizeNumber(raw.porcentajeAsistencia),
  };
}

function normalizePersonaFichaResumen(raw: Record<string, unknown>): PersonaFichaResumen {
  const rawPersona = (raw.persona ?? {}) as Record<string, unknown>;
  const rawFinanciero = (raw.resumenFinanciero ?? {}) as Record<string, unknown>;

  return {
    persona: {
      idPersona: normalizeId(rawPersona.idPersona),
      nroPadron: normalizeNullableNumber(rawPersona.nroPadron),
      nombres: normalizeString(rawPersona.nombres),
      nombreCompleto: normalizeString(rawPersona.nombreCompleto),
      dni: normalizeNullableString(rawPersona.dni),
      telefono: normalizeNullableString(rawPersona.telefono),
      estado: normalizeString(rawPersona.estado, 'ACTIVO'),
    },
    resumenFinanciero: {
      deudaPendienteTotal: normalizeNumber(rawFinanciero.deudaPendienteTotal),
    },
    resumenFaenas: normalizeResumenAsistencia((raw.resumenFaenas ?? {}) as Record<string, unknown>),
    resumenAsambleas: normalizeResumenAsistencia((raw.resumenAsambleas ?? {}) as Record<string, unknown>),
    ultimosEventos: Array.isArray(raw.ultimosEventos)
      ? raw.ultimosEventos.map((evento) => normalizePersonaFichaEvento(evento as Record<string, unknown>))
      : [],
  };
}

function normalizePersonaFichaEvento(raw: Record<string, unknown>) {
  return {
    tipo: normalizeString(raw.tipo),
    idEvento: normalizeId(raw.idEvento),
    idAsistencia: normalizeId(raw.idAsistencia),
    fecha: normalizeString(raw.fecha),
    nombreEvento: normalizeString(raw.nombreEvento, 'Evento sin nombre'),
    estadoAsistencia: normalizeString(raw.estadoAsistencia),
    horaLlegada: normalizeNullableString(raw.horaLlegada),
    generoObligacion: normalizeBoolean(raw.generoObligacion),
    multaGenerada: normalizeBoolean(raw.multaGenerada),
    montoRelacionado: normalizeNullableNumber(raw.montoRelacionado),
    idObligacion: normalizeNullableId(raw.idObligacion),
    relacionObligacionAmbigua: normalizeBoolean(raw.relacionObligacionAmbigua),
  };
}

function normalizePersonaAsistencia(raw: Record<string, unknown>): PersonaAsistenciaFicha {
  return {
    tipoEvento: normalizeString(raw.tipoEvento),
    idEvento: normalizeId(raw.idEvento),
    idAsistencia: normalizeId(raw.idAsistencia),
    fecha: normalizeString(raw.fecha),
    nombreEvento: normalizeString(raw.nombreEvento, 'Evento sin nombre'),
    estado: normalizeString(raw.estado),
    horaLlegada: normalizeNullableString(raw.horaLlegada),
    observacion: normalizeNullableString(raw.observacion),
    multaGenerada: normalizeBoolean(raw.multaGenerada),
    montoMulta: normalizeNullableNumber(raw.montoMulta),
    idObligacion: normalizeNullableId(raw.idObligacion),
    estadoObligacion: normalizeNullableString(raw.estadoObligacion),
    relacionObligacionAmbigua: normalizeBoolean(raw.relacionObligacionAmbigua),
  };
}

function normalizePersonaObligacionEvento(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const eventRaw = raw as Record<string, unknown>;

  return {
    tipoEvento: normalizeString(eventRaw.tipoEvento),
    idEvento: normalizeId(eventRaw.idEvento),
    nombreEvento: normalizeString(eventRaw.nombreEvento, 'Evento sin nombre'),
    fecha: normalizeString(eventRaw.fecha),
    idAsistencia: normalizeNullableId(eventRaw.idAsistencia),
  };
}

function normalizePersonaObligacion(raw: Record<string, unknown>): PersonaObligacionFicha {
  return {
    idObligacion: normalizeId(raw.idObligacion),
    fecha: normalizeString(raw.fecha),
    fechaEmision: normalizeNullableString(raw.fechaEmision),
    fechaVencimiento: normalizeNullableString(raw.fechaVencimiento),
    periodo: normalizeNullableString(raw.periodo),
    idConceptoCobro: normalizeNullableId(raw.idConceptoCobro) ?? undefined,
    codigoConcepto: normalizeNullableString(raw.codigoConcepto),
    concepto: normalizeString(raw.concepto, 'Obligación'),
    tipoConcepto: normalizeNullableString(raw.tipoConcepto),
    descripcion: normalizeNullableString(raw.descripcion),
    importeOriginal: normalizeNumber(raw.importeOriginal),
    montoPagado: normalizeNumber(raw.montoPagado),
    montoExonerado: normalizeNumber(raw.montoExonerado),
    montoCompensado: normalizeNumber(raw.montoCompensado),
    saldoPendiente: normalizeNumber(raw.saldoPendiente),
    estado: normalizeString(raw.estado),
    origen: normalizeString(raw.origen),
    tipoEvento: normalizeNullableString(raw.tipoEvento),
    idEvento: normalizeNullableId(raw.idEvento),
    idAsistencia: normalizeNullableId(raw.idAsistencia),
    eventoRelacionado: normalizePersonaObligacionEvento(raw.eventoRelacionado),
  };
}

function normalizePersonaPago(raw: Record<string, unknown>): PersonaPagoFicha {
  return {
    idObligacionPago: normalizeId(raw.idObligacionPago),
    idObligacion: normalizeId(raw.idObligacion),
    idMovimiento: normalizeId(raw.idMovimiento),
    fecha: normalizeString(raw.fecha),
    importe: normalizeNumber(raw.importe),
    montoMovimiento: normalizeNumber(raw.montoMovimiento),
    idConceptoCobro: normalizeNullableId(raw.idConceptoCobro) ?? undefined,
    codigoConcepto: normalizeNullableString(raw.codigoConcepto),
    concepto: normalizeString(raw.concepto, 'Pago'),
    tipoConcepto: normalizeNullableString(raw.tipoConcepto),
    medioPago: normalizeString(raw.medioPago, 'No registrado'),
    referencia: normalizeNullableString(raw.referencia),
    descripcion: normalizeNullableString(raw.descripcion),
    observaciones: normalizeNullableString(raw.observaciones),
    estado: normalizeString(raw.estado),
    anulado: normalizeBoolean(raw.anulado),
    tipoEvento: normalizeNullableString(raw.tipoEvento),
    idEvento: normalizeNullableId(raw.idEvento),
  };
}

function normalizePersonaTerreno(raw: Record<string, unknown>): PersonaTerrenoFicha {
  return {
    idPersonaTerreno: normalizeId(raw.idPersonaTerreno),
    idTerreno: normalizeId(raw.idTerreno),
    codigoLote: normalizeNullableString(raw.codigoLote),
    manzana: normalizeNullableString(raw.manzana),
    numeroLote: normalizeNullableString(raw.numeroLote),
    descripcion: normalizeString(raw.descripcion, 'Terreno'),
    areaAproxM2: normalizeNullableNumber(raw.areaAproxM2),
    areaLegalM2: normalizeNullableNumber(raw.areaLegalM2),
    partidaRegistral: normalizeNullableString(raw.partidaRegistral),
    ubicacion: normalizeNullableString(raw.ubicacion),
    estado: normalizeString(raw.estado),
    tipoRelacion: normalizeString(raw.tipoRelacion),
    porcentajeParticipacion: normalizeNullableNumber(raw.porcentajeParticipacion),
    relacionPrincipal: raw.relacionPrincipal === null || raw.relacionPrincipal === undefined
      ? null
      : normalizeBoolean(raw.relacionPrincipal),
  };
}

function normalizePaginatedFichaResponse<T>(
  raw: unknown,
  normalizeItem: (item: Record<string, unknown>) => T,
): PersonaFichaPaginatedResponse<T> {
  const response = (raw ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(response.items) ? response.items : [];

  return {
    items: rawItems.map((item) => normalizeItem(item as Record<string, unknown>)),
    total: normalizeNumber(response.total),
    page: normalizeNumber(response.page, 1),
    limit: normalizeNumber(response.limit, 20),
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === 'object') {
      const candidate = responseData as { message?: string; error?: string };

      if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message;
      }

      if (typeof candidate.error === 'string' && candidate.error.trim()) {
        return candidate.error;
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo completar la operación de personas.';
}

export async function getPersonas(
  tenantId: string | number,
  query: ListQuery,
  signal?: AbortSignal,
): Promise<PersonasListResponse> {
  try {
    const response = await fetchPersonas(tenantId, buildListParams(query), signal);
    const items = extractItems(response.data).map(normalizePersona);

    return {
      items,
      total: parseTotal(response, query.page, query.pageSize, items.length),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaById(
  tenantId: string | number,
  idPersona: string | number,
  signal?: AbortSignal,
): Promise<Persona> {
  try {
    const data = (await fetchPersonaById(tenantId, idPersona, signal)) as PersonaApiShape;
    return normalizePersona(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createPersona(
  tenantId: string | number,
  payload: PersonaCreateDto,
): Promise<Persona> {
  try {
    const data = (await postPersona(tenantId, normalizeCreatePayload(payload))) as PersonaApiShape;
    return normalizePersona(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updatePersona(
  tenantId: string | number,
  idPersona: string | number,
  payload: PersonaUpdateDto,
): Promise<Persona> {
  try {
    const data = (await patchPersona(
      tenantId,
      idPersona,
      normalizeUpdatePayload(payload),
    )) as PersonaApiShape;
    return normalizePersona(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaFichaResumen(
  tenantId: string | number,
  idPersona: string | number,
  signal?: AbortSignal,
): Promise<PersonaFichaResumen> {
  try {
    const data = (await fetchPersonaFichaResource(tenantId, idPersona, 'ficha', undefined, signal)) as Record<
      string,
      unknown
    >;
    return normalizePersonaFichaResumen(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaFichaAsistencias(
  tenantId: string | number,
  idPersona: string | number,
  query: PersonaFichaAsistenciasQuery,
  signal?: AbortSignal,
): Promise<PersonaFichaPaginatedResponse<PersonaAsistenciaFicha>> {
  try {
    const data = await fetchPersonaFichaResource(
      tenantId,
      idPersona,
      'asistencias',
      {
        tipo: query.tipo,
        estado: query.estado,
        anio: query.anio,
        page: query.page,
        limit: query.limit,
      },
      signal,
    );

    return normalizePaginatedFichaResponse(data, normalizePersonaAsistencia);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaFichaObligaciones(
  tenantId: string | number,
  idPersona: string | number,
  query: PersonaFichaObligacionesQuery,
  signal?: AbortSignal,
): Promise<PersonaFichaPaginatedResponse<PersonaObligacionFicha>> {
  try {
    const data = await fetchPersonaFichaResource(
      tenantId,
      idPersona,
      'obligaciones',
      {
        estado: query.estado,
        page: query.page,
        limit: query.limit,
      },
      signal,
    );

    return normalizePaginatedFichaResponse(data, normalizePersonaObligacion);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaFichaPagos(
  tenantId: string | number,
  idPersona: string | number,
  query: PersonaFichaPagosQuery,
  signal?: AbortSignal,
): Promise<PersonaFichaPaginatedResponse<PersonaPagoFicha>> {
  try {
    const data = await fetchPersonaFichaResource(
      tenantId,
      idPersona,
      'pagos',
      {
        page: query.page,
        limit: query.limit,
      },
      signal,
    );

    return normalizePaginatedFichaResponse(data, normalizePersonaPago);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPersonaFichaTerrenos(
  tenantId: string | number,
  idPersona: string | number,
  signal?: AbortSignal,
): Promise<PersonaTerrenoFicha[]> {
  try {
    const data = await fetchPersonaFichaResource(tenantId, idPersona, 'terrenos', undefined, signal);
    return Array.isArray(data) ? data.map((item) => normalizePersonaTerreno(item as Record<string, unknown>)) : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deletePersona(
  tenantId: string | number,
  idPersona: string | number,
): Promise<Persona> {
  try {
    const data = (await deletePersonaRequest(tenantId, idPersona)) as PersonaApiShape;
    return normalizePersona(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
