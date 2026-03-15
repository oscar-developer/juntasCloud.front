import axios from 'axios';
import {
  deleteJuntaDirectiva as deleteJuntaDirectivaRequest,
  fetchJuntaDirectivaById,
  fetchJuntasDirectivas,
  patchJuntaDirectiva,
  postJuntaDirectiva,
} from '../api/juntasDirectivasApi';
import type { JuntaDirectivaApiShape, JuntasDirectivasListEnvelope } from '../api/types';
import type {
  JuntaDirectiva,
  JuntaDirectivaCreateDto,
  JuntasDirectivasListQuery,
  JuntaDirectivaUpdateDto,
} from '../types';

function normalizeJuntaDirectiva(raw: JuntaDirectivaApiShape): JuntaDirectiva {
  return {
    idJunta: raw.idJunta ?? raw.id_junta ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    nombre: raw.nombre ?? '',
    fechaEleccion: raw.fechaEleccion ?? raw.fecha_eleccion ?? '',
    fechaInicio: raw.fechaInicio ?? raw.fecha_inicio ?? '',
    fechaFin: raw.fechaFin ?? raw.fecha_fin ?? '',
    estado: raw.estado ?? 'PROYECTADA',
    documentoSustento: raw.documentoSustento ?? raw.documento_sustento ?? null,
    observaciones: raw.observaciones ?? null,
  };
}

function normalizePayload(payload: JuntaDirectivaCreateDto | JuntaDirectivaUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('nombre', payload.nombre?.trim());
  assign('fechaEleccion', payload.fechaEleccion);
  assign('fechaInicio', payload.fechaInicio);
  assign('fechaFin', payload.fechaFin);
  assign('estado', payload.estado);
  assign('documentoSustento', payload.documentoSustento?.trim() || undefined);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function extractItems(data: JuntasDirectivasListEnvelope): JuntaDirectivaApiShape[] {
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

function buildListParams(query: JuntasDirectivasListQuery) {
  const params: Record<string, string> = {};

  if (query.estado && query.estado !== 'TODOS') {
    params.estado = query.estado;
  }

  if (query.from?.trim()) {
    params.from = query.from.trim();
  }

  if (query.to?.trim()) {
    params.to = query.to.trim();
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

  return 'No se pudo completar la operación de juntas directivas.';
}

export async function getJuntasDirectivas(
  tenantId: string | number,
  query: JuntasDirectivasListQuery,
  signal?: AbortSignal,
): Promise<JuntaDirectiva[]> {
  try {
    const data = await fetchJuntasDirectivas(tenantId, buildListParams(query), signal);
    return extractItems(data).map(normalizeJuntaDirectiva);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getJuntaDirectivaById(
  tenantId: string | number,
  idJunta: string | number,
  signal?: AbortSignal,
): Promise<JuntaDirectiva> {
  try {
    const data = (await fetchJuntaDirectivaById(tenantId, idJunta, signal)) as JuntaDirectivaApiShape;
    return normalizeJuntaDirectiva(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createJuntaDirectiva(
  tenantId: string | number,
  payload: JuntaDirectivaCreateDto,
): Promise<JuntaDirectiva> {
  try {
    const data = (await postJuntaDirectiva(tenantId, normalizePayload(payload))) as JuntaDirectivaApiShape;
    return normalizeJuntaDirectiva(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateJuntaDirectiva(
  tenantId: string | number,
  idJunta: string | number,
  payload: JuntaDirectivaUpdateDto,
): Promise<JuntaDirectiva> {
  try {
    const data = (await patchJuntaDirectiva(tenantId, idJunta, normalizePayload(payload))) as JuntaDirectivaApiShape;
    return normalizeJuntaDirectiva(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteJuntaDirectiva(
  tenantId: string | number,
  idJunta: string | number,
): Promise<void> {
  try {
    await deleteJuntaDirectivaRequest(tenantId, idJunta);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
