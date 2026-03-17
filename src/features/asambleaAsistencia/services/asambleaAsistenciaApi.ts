import axios from 'axios';
import {
  fetchAsambleaAttendanceList,
  patchAsambleaAttendance as patchAsambleaAttendanceRequest,
  postAsambleaAttendance,
} from '../api/asambleaAsistenciaApi';
import type { AsambleaAttendanceApiShape } from '../api/types';
import type {
  AsambleaAttendanceCreateDto,
  AsambleaAttendanceListQuery,
  AsambleaAttendanceRecord,
  AsambleaAttendanceUpdateDto,
} from '../types';

function normalizeBoolean(value: boolean | null | undefined, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeAttendance(raw: AsambleaAttendanceApiShape): AsambleaAttendanceRecord {
  return {
    idAsistencia: raw.idAsistencia ?? raw.id_asistencia ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    idAsamblea: raw.idAsamblea ?? raw.id_asamblea ?? '',
    idPersona: raw.idPersona ?? raw.id_persona ?? '',
    estado: raw.estado ?? 'PENDIENTE',
    horaLlegada: raw.horaLlegada ?? raw.hora_llegada ?? null,
    esPadronadoEnMomento: normalizeBoolean(
      raw.esPadronadoEnMomento ?? raw.es_padronado_en_momento,
    ),
    tieneDerechoVoto: raw.tieneDerechoVoto ?? raw.tiene_derecho_voto ?? false,
    votoEmitido: raw.votoEmitido ?? raw.voto_emitido ?? false,
    observaciones: raw.observaciones ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? undefined,
    createdByUser: raw.createdByUser ?? raw.created_by_user ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
    updatedByUser: raw.updatedByUser ?? raw.updated_by_user ?? null,
    anulado: normalizeBoolean(raw.anulado, false),
    anuladoAt: raw.anuladoAt ?? raw.anulado_at ?? null,
    anuladoByUser: raw.anuladoByUser ?? raw.anulado_by_user ?? null,
    motivoAnulacion: raw.motivoAnulacion ?? raw.motivo_anulacion ?? null,
  };
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

function normalizePayload(payload: AsambleaAttendanceCreateDto | AsambleaAttendanceUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('idPersona', payload.idPersona);
  assign('estado', payload.estado);
  assign('horaLlegada', normalizeTimeToken(payload.horaLlegada));
  assign('esPadronadoEnMomento', payload.esPadronadoEnMomento);
  assign('tieneDerechoVoto', payload.tieneDerechoVoto);
  assign('votoEmitido', payload.votoEmitido);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function buildListParams(query: AsambleaAttendanceListQuery) {
  const params: Record<string, string | number | boolean> = {};

  if (query.estado) {
    params.estado = query.estado;
  }

  if (typeof query.anulado === 'boolean') {
    params.anulado = query.anulado;
  }

  if (query.idPersona !== undefined && query.idPersona !== null && query.idPersona !== '') {
    params.idPersona = query.idPersona;
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

  return 'No se pudo completar la operación de asistencia de asamblea.';
}

export async function getAsambleaAttendanceList(
  tenantId: string | number,
  idAsamblea: string | number,
  query: AsambleaAttendanceListQuery = {},
  signal?: AbortSignal,
): Promise<AsambleaAttendanceRecord[]> {
  try {
    const data = await fetchAsambleaAttendanceList(
      tenantId,
      idAsamblea,
      buildListParams(query),
      signal,
    );

    return data.map(normalizeAttendance);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createAsambleaAttendance(
  tenantId: string | number,
  idAsamblea: string | number,
  payload: AsambleaAttendanceCreateDto,
): Promise<AsambleaAttendanceRecord> {
  try {
    const data = (await postAsambleaAttendance(
      tenantId,
      idAsamblea,
      normalizePayload(payload),
    )) as AsambleaAttendanceApiShape;

    return normalizeAttendance(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateAsambleaAttendance(
  tenantId: string | number,
  idAsistencia: string | number,
  payload: AsambleaAttendanceUpdateDto,
): Promise<AsambleaAttendanceRecord> {
  try {
    const data = (await patchAsambleaAttendanceRequest(
      tenantId,
      idAsistencia,
      normalizePayload(payload),
    )) as AsambleaAttendanceApiShape;

    return normalizeAttendance(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
