import axios from 'axios';
import {
  deleteAsamblea as deleteAsambleaRequest,
  fetchAsambleaById,
  fetchAsambleas,
  patchAsamblea,
  postAsamblea,
} from '../api/asambleasApi';
import type { AsambleaApiShape, AsambleasListEnvelope } from '../api/types';
import type {
  Asamblea,
  AsambleaCreateDto,
  AsambleaListQuery,
  AsambleaUpdateDto,
} from '../types';

function normalizeNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeAsamblea(raw: AsambleaApiShape): Asamblea {
  return {
    idAsamblea: raw.idAsamblea ?? raw.id_asamblea ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    fechaProgramada: raw.fechaProgramada ?? raw.fecha_programada ?? '',
    horaInicioReal: raw.horaInicioReal ?? raw.hora_inicio_real ?? null,
    horaFinReal: raw.horaFinReal ?? raw.hora_fin_real ?? null,
    tipo: raw.tipo ?? 'ORDINARIA',
    convocatoria: raw.convocatoria ?? null,
    estado: raw.estado ?? 'PROGRAMADA',
    temaPrincipal: raw.temaPrincipal ?? raw.tema_principal ?? '',
    lugar: raw.lugar ?? null,
    quorumRequerido: normalizeNumber(raw.quorumRequerido ?? raw.quorum_requerido),
    quorumAlcanzado: normalizeNumber(raw.quorumAlcanzado ?? raw.quorum_alcanzado),
    numeroActa: raw.numeroActa ?? raw.numero_acta ?? null,
    observaciones: raw.observaciones ?? null,
    cerradaAt: raw.cerradaAt ?? raw.cerrada_at ?? null,
    cerradaByUser: raw.cerradaByUser ?? raw.cerrada_by_user ?? null,
  };
}

function normalizeDateValue(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00` : trimmed;
}

function normalizeTimeToken(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const isoMatch = trimmed.match(/T(\d{2}:\d{2}:\d{2})/);
  return isoMatch ? isoMatch[1] : trimmed;
}

function combineDateAndTime(dateValue: string | undefined, timeValue: string | undefined) {
  const normalizedDate = normalizeDateValue(dateValue);
  const normalizedTime = normalizeTimeToken(timeValue);

  if (!normalizedTime) {
    return undefined;
  }

  if (!normalizedDate) {
    return normalizedTime;
  }

  const datePart = normalizedDate.split('T')[0];
  return `${datePart}T${normalizedTime}`;
}

function normalizePayload(payload: AsambleaCreateDto | AsambleaUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('fechaProgramada', normalizeDateValue(payload.fechaProgramada));
  assign('horaInicioReal', combineDateAndTime(payload.fechaProgramada, payload.horaInicioReal));
  assign('horaFinReal', combineDateAndTime(payload.fechaProgramada, payload.horaFinReal));
  assign('tipo', payload.tipo);
  assign('convocatoria', payload.convocatoria);
  assign('estado', payload.estado);
  assign('temaPrincipal', payload.temaPrincipal?.trim());
  assign('lugar', payload.lugar?.trim() || undefined);
  assign('quorumRequerido', payload.quorumRequerido);
  assign('quorumAlcanzado', payload.quorumAlcanzado);
  assign('numeroActa', payload.numeroActa?.trim() || undefined);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function extractItems(data: AsambleasListEnvelope): AsambleaApiShape[] {
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

function buildListParams(query: AsambleaListQuery) {
  const params: Record<string, string> = {};

  if (query.from?.trim()) {
    params.from = query.from.trim();
  }

  if (query.to?.trim()) {
    params.to = query.to.trim();
  }

  if (query.tipo && query.tipo !== 'TODOS') {
    params.tipo = query.tipo;
  }

  if (query.convocatoria && query.convocatoria !== 'TODOS') {
    params.convocatoria = query.convocatoria;
  }

  if (query.estado && query.estado !== 'TODOS') {
    params.estado = query.estado;
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

  return 'No se pudo completar la operación de asambleas.';
}

export async function getAsambleas(
  tenantId: string | number,
  query: AsambleaListQuery,
  signal?: AbortSignal,
): Promise<Asamblea[]> {
  try {
    const data = await fetchAsambleas(tenantId, buildListParams(query), signal);
    return extractItems(data).map(normalizeAsamblea);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAsambleaById(
  tenantId: string | number,
  idAsamblea: string | number,
  signal?: AbortSignal,
): Promise<Asamblea> {
  try {
    const data = (await fetchAsambleaById(tenantId, idAsamblea, signal)) as AsambleaApiShape;
    return normalizeAsamblea(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createAsamblea(
  tenantId: string | number,
  payload: AsambleaCreateDto,
): Promise<Asamblea> {
  try {
    const data = (await postAsamblea(tenantId, normalizePayload(payload))) as AsambleaApiShape;
    return normalizeAsamblea(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateAsamblea(
  tenantId: string | number,
  idAsamblea: string | number,
  payload: AsambleaUpdateDto,
): Promise<Asamblea> {
  try {
    const data = (await patchAsamblea(tenantId, idAsamblea, normalizePayload(payload))) as AsambleaApiShape;
    return normalizeAsamblea(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteAsamblea(tenantId: string | number, idAsamblea: string | number): Promise<void> {
  try {
    await deleteAsambleaRequest(tenantId, idAsamblea);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
