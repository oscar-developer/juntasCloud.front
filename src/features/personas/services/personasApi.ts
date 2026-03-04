import axios from 'axios';
import type { AxiosResponse } from 'axios';
import {
  deletePersona,
  fetchPersonaById,
  fetchPersonas,
  patchPersona,
  postPersona,
} from '../api/personasApi';
import type { PersonaApiShape, PersonasListEnvelope } from '../api/types';
import type {
  ListQuery,
  Persona,
  PersonaCreateDto,
  PersonasListResponse,
  PersonaUpdateDto,
} from '../types';

function normalizePersona(raw: PersonaApiShape): Persona {
  return {
    idPersona: raw.idPersona ?? raw.id_persona ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    nombres: raw.nombres ?? '',
    apellidoPaterno: raw.apellidoPaterno ?? raw.apellido_paterno ?? '',
    apellidoMaterno: raw.apellidoMaterno ?? raw.apellido_materno ?? '',
    dni: raw.dni ?? null,
    telefono: raw.telefono ?? null,
    referenciaVivienda: raw.referenciaVivienda ?? raw.referencia_vivienda ?? null,
    tipoParticipante: raw.tipoParticipante ?? raw.tipo_participante ?? 'NO_PADRONADO',
    estado: raw.estado ?? 'ACTIVO',
    fechaRegistro: raw.fechaRegistro ?? raw.fecha_registro ?? '',
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
  assign('telefono', payload.telefono?.trim() || undefined);
  assign('referenciaVivienda', payload.referenciaVivienda?.trim() || undefined);
  assign('tipoParticipante', payload.tipoParticipante);
  assign('estado', payload.estado);
  assign('fechaRegistro', payload.fechaRegistro);
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
