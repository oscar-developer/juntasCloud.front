import axios from 'axios';
import {
  deleteJuntaMiembro as deleteJuntaMiembroRequest,
  fetchJuntaMiembroById,
  fetchJuntaMiembros,
  patchJuntaMiembro,
  postJuntaMiembro,
} from '../api/juntaMiembrosApi';
import type { JuntaMiembroApiShape, JuntaMiembrosListEnvelope } from '../api/types';
import type {
  JuntaMiembro,
  JuntaMiembroCreateDto,
  JuntaMiembrosListQuery,
  JuntaMiembroUpdateDto,
} from '../types';

function normalizeJuntaMiembro(raw: JuntaMiembroApiShape): JuntaMiembro {
  return {
    idJuntaMiembro: raw.idJuntaMiembro ?? raw.id_junta_miembro ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    idJunta: raw.idJunta ?? raw.id_junta ?? '',
    idPersona: raw.idPersona ?? raw.id_persona ?? '',
    cargo: raw.cargo ?? 'OTRO',
    fechaInicio: raw.fechaInicio ?? raw.fecha_inicio ?? '',
    fechaFin: raw.fechaFin ?? raw.fecha_fin ?? '',
    observaciones: raw.observaciones ?? null,
  };
}

function normalizePayload(payload: JuntaMiembroCreateDto | JuntaMiembroUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('idJunta', payload.idJunta);
  assign('idPersona', payload.idPersona);
  assign('cargo', payload.cargo);
  assign('fechaInicio', payload.fechaInicio);
  assign('fechaFin', payload.fechaFin);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function extractItems(data: JuntaMiembrosListEnvelope): JuntaMiembroApiShape[] {
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

function buildListParams(query: JuntaMiembrosListQuery) {
  const params: Record<string, string> = {
    idJunta: String(query.idJunta),
  };

  if (query.idPersona && query.idPersona !== 'TODOS') {
    params.idPersona = String(query.idPersona);
  }

  if (query.cargo && query.cargo !== 'TODOS') {
    params.cargo = query.cargo;
  }

  if (query.vigentes && query.vigentes !== 'TODOS') {
    params.vigentes = query.vigentes;
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

  return 'No se pudo completar la operación de miembros de junta.';
}

export async function getJuntaMiembros(
  tenantId: string | number,
  query: JuntaMiembrosListQuery,
  signal?: AbortSignal,
): Promise<JuntaMiembro[]> {
  try {
    const data = await fetchJuntaMiembros(tenantId, buildListParams(query), signal);
    return extractItems(data).map(normalizeJuntaMiembro);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getJuntaMiembroById(
  tenantId: string | number,
  idJuntaMiembro: string | number,
  signal?: AbortSignal,
): Promise<JuntaMiembro> {
  try {
    const data = (await fetchJuntaMiembroById(tenantId, idJuntaMiembro, signal)) as JuntaMiembroApiShape;
    return normalizeJuntaMiembro(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createJuntaMiembro(
  tenantId: string | number,
  payload: JuntaMiembroCreateDto,
): Promise<JuntaMiembro> {
  try {
    const data = (await postJuntaMiembro(tenantId, normalizePayload(payload))) as JuntaMiembroApiShape;
    return normalizeJuntaMiembro(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateJuntaMiembro(
  tenantId: string | number,
  idJuntaMiembro: string | number,
  payload: JuntaMiembroUpdateDto,
): Promise<JuntaMiembro> {
  try {
    const data = (await patchJuntaMiembro(tenantId, idJuntaMiembro, normalizePayload(payload))) as JuntaMiembroApiShape;
    return normalizeJuntaMiembro(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteJuntaMiembro(
  tenantId: string | number,
  idJuntaMiembro: string | number,
): Promise<void> {
  try {
    await deleteJuntaMiembroRequest(tenantId, idJuntaMiembro);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
