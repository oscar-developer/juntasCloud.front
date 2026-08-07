import axios from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  AnularFaenaParticipacionDto,
  FaenaParticipacion,
  FaenaParticipacionApiShape,
  FaenaParticipacionCreateDto,
  FaenaParticipacionListQuery,
  FaenaParticipacionUpdateDto,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveFaenasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/faenas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);
    return hasApiInBase ? '/faenas' : '/api/faenas';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? '/faenas' : '/api/faenas';
  }
}

function resolveFaenaParticipacionesBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/faena-participaciones';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);
    return hasApiInBase ? '/faena-participaciones' : '/api/faena-participaciones';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, ''))
      ? '/faena-participaciones'
      : '/api/faena-participaciones';
  }
}

function createTenantConfig(tenantId: string | number, signal?: AbortSignal): TenantScopedConfig {
  return {
    headers: {
      'X-Tenant-Id': String(tenantId),
    },
    signal,
  };
}

function normalizeBoolean(value: boolean | null | undefined, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

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

function normalizeFaenaParticipacion(raw: FaenaParticipacionApiShape): FaenaParticipacion {
  return {
    idFaenaParticipacion: raw.idFaenaParticipacion ?? raw.id_faena_participacion ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    idFaena: raw.idFaena ?? raw.id_faena ?? '',
    idPersona: raw.idPersona ?? raw.id_persona ?? '',
    estado: raw.estado ?? 'PENDIENTE',
    horaLlegada: raw.horaLlegada ?? raw.hora_llegada ?? null,
    cantPersonasExtra: raw.cantPersonasExtra ?? raw.cant_personas_extra ?? 0,
    multaGenerada: normalizeBoolean(raw.multaGenerada ?? raw.multa_generada, false),
    montoMulta: normalizeNumber(raw.montoMulta ?? raw.monto_multa),
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

function normalizePayload(payload: FaenaParticipacionCreateDto | FaenaParticipacionUpdateDto) {
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
  assign('cantPersonasExtra', payload.cantPersonasExtra);
  assign('multaGenerada', payload.multaGenerada);
  assign('montoMulta', payload.montoMulta);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function buildListParams(query: FaenaParticipacionListQuery) {
  const params: Record<string, string | number | boolean> = {};

  if (query.estado && query.estado !== 'TODOS') {
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
      const candidate = responseData as { message?: string | string[]; error?: string };

      if (Array.isArray(candidate.message) && candidate.message.length > 0) {
        return candidate.message.join(' ');
      }

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

  return 'No se pudo completar la operación de participaciones de faena.';
}

const FAENAS_BASE_PATH = resolveFaenasBasePath();
const FAENA_PARTICIPACIONES_BASE_PATH = resolveFaenaParticipacionesBasePath();

export async function getFaenaParticipaciones(
  tenantId: string | number,
  idFaena: string | number,
  query: FaenaParticipacionListQuery = {},
  signal?: AbortSignal,
): Promise<FaenaParticipacion[]> {
  try {
    const response = await apiClient.get<FaenaParticipacionApiShape[]>(
      `${FAENAS_BASE_PATH}/${idFaena}/participaciones`,
      {
        ...createTenantConfig(tenantId, signal),
        params: buildListParams(query),
      },
    );

    return response.data.map(normalizeFaenaParticipacion);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getFaenaParticipacionById(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  signal?: AbortSignal,
): Promise<FaenaParticipacion> {
  try {
    const response = await apiClient.get<FaenaParticipacionApiShape>(
      `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}`,
      createTenantConfig(tenantId, signal),
    );

    return normalizeFaenaParticipacion(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createFaenaParticipacion(
  tenantId: string | number,
  idFaena: string | number,
  payload: FaenaParticipacionCreateDto,
): Promise<FaenaParticipacion> {
  try {
    const response = await apiClient.post<FaenaParticipacionApiShape>(
      `${FAENAS_BASE_PATH}/${idFaena}/participaciones`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeFaenaParticipacion(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateFaenaParticipacion(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  payload: FaenaParticipacionUpdateDto,
): Promise<FaenaParticipacion> {
  try {
    const response = await apiClient.patch<FaenaParticipacionApiShape>(
      `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeFaenaParticipacion(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function anularFaenaParticipacion(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  payload: AnularFaenaParticipacionDto,
): Promise<FaenaParticipacion> {
  try {
    const response = await apiClient.post<FaenaParticipacionApiShape>(
      `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}/anular`,
      {
        motivoAnulacion: payload.motivoAnulacion.trim(),
      },
      createTenantConfig(tenantId),
    );

    return normalizeFaenaParticipacion(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
