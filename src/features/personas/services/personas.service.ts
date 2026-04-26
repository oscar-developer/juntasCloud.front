import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  ListQuery,
  Persona,
  PersonaCreateDto,
  PersonasListResponse,
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
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/personas' : '/api/personas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/personas' : '/api/personas';
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

function deletePersona(tenantId: string | number, idPersona: string | number) {
  return apiClient.delete(`${PERSONAS_BASE_PATH}/${idPersona}`, createTenantConfig(tenantId));
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
    estado: raw.estado ?? 'ACTIVO',
    fechaRegistro: raw.fechaRegistro ?? raw.fecha_registro ?? '',
    fechaBaja: raw.fechaBaja ?? raw.fecha_baja ?? null,
    observaciones: raw.observaciones ?? null,
  };
}

function normalizePayload(payload: PersonaCreateDto | PersonaUpdateDto) {
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
  assign('estado', payload.estado);
  assign('fechaRegistro', payload.fechaRegistro);
  assign('fechaBaja', payload.fechaBaja || undefined);
  assign('observaciones', payload.observaciones?.trim() || undefined);

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
    const data = (await postPersona(tenantId, normalizePayload(payload))) as PersonaApiShape;
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
    const data = (await patchPersona(tenantId, idPersona, normalizePayload(payload))) as PersonaApiShape;
    return normalizePersona(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function retirePersona(
  tenantId: string | number,
  idPersona: string | number,
): Promise<void> {
  try {
    await deletePersona(tenantId, idPersona);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
