import axios from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  Faena,
  FaenaApiShape,
  FaenaCreateDto,
  FaenaListQuery,
  FaenasListEnvelope,
  FaenaUpdateDto,
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

function createTenantConfig(tenantId: string | number, signal?: AbortSignal): TenantScopedConfig {
  return {
    headers: {
      'X-Tenant-Id': String(tenantId),
    },
    signal,
  };
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

function normalizeBoolean(value: boolean | string | number | null | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'si', 'yes'].includes(value.trim().toLowerCase());
  }

  return false;
}

function normalizeFaena(raw: FaenaApiShape): Faena {
  return {
    idFaena: raw.idFaena ?? raw.id_faena ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    fechaProgramada: raw.fechaProgramada ?? raw.fecha_programada ?? '',
    horaInicio: raw.horaInicio ?? raw.hora_inicio ?? null,
    horaFin: raw.horaFin ?? raw.hora_fin ?? null,
    descripcion: raw.descripcion ?? '',
    lugar: raw.lugar ?? null,
    tipoFaena: raw.tipoFaena ?? raw.tipo_faena ?? 'ORDINARIA',
    esObligatoria: normalizeBoolean(raw.esObligatoria ?? raw.es_obligatoria),
    estado: raw.estado ?? 'PROGRAMADA',
    montoMultaBase: normalizeNumber(raw.montoMultaBase ?? raw.monto_multa_base),
    observaciones: raw.observaciones ?? null,
  };
}

function normalizeTimeValue(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();
  return /^\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
}

function normalizePayload(payload: FaenaCreateDto | FaenaUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('fechaProgramada', payload.fechaProgramada);
  assign('horaInicio', normalizeTimeValue(payload.horaInicio));
  assign('horaFin', normalizeTimeValue(payload.horaFin));
  assign('descripcion', payload.descripcion?.trim());
  assign('lugar', payload.lugar?.trim() || undefined);
  assign('tipoFaena', payload.tipoFaena);
  assign('esObligatoria', payload.esObligatoria);
  assign('estado', payload.estado);
  assign('montoMultaBase', payload.montoMultaBase);
  assign('observaciones', payload.observaciones?.trim() || undefined);

  return normalizedPayload;
}

function extractItems(data: FaenasListEnvelope): FaenaApiShape[] {
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

function buildListParams(query: FaenaListQuery) {
  const params: Record<string, string> = {};

  if (query.from?.trim()) {
    params.from = query.from.trim();
  }

  if (query.to?.trim()) {
    params.to = query.to.trim();
  }

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (query.tipoFaena && query.tipoFaena !== 'TODOS') {
    params.tipoFaena = query.tipoFaena;
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

  return 'No se pudo completar la operacion de faenas.';
}

const FAENAS_BASE_PATH = resolveFaenasBasePath();

export async function getFaenas(
  tenantId: string | number,
  query: FaenaListQuery,
  signal?: AbortSignal,
): Promise<Faena[]> {
  try {
    const response = await apiClient.get<FaenasListEnvelope>(FAENAS_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });

    return extractItems(response.data).map(normalizeFaena);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getFaenaById(
  tenantId: string | number,
  idFaena: string | number,
  signal?: AbortSignal,
): Promise<Faena> {
  try {
    const response = await apiClient.get<FaenaApiShape>(`${FAENAS_BASE_PATH}/${idFaena}`, {
      ...createTenantConfig(tenantId, signal),
    });

    return normalizeFaena(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createFaena(
  tenantId: string | number,
  payload: FaenaCreateDto,
): Promise<Faena> {
  try {
    const response = await apiClient.post<FaenaApiShape>(
      FAENAS_BASE_PATH,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeFaena(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateFaena(
  tenantId: string | number,
  idFaena: string | number,
  payload: FaenaUpdateDto,
): Promise<Faena> {
  try {
    const response = await apiClient.patch<FaenaApiShape>(
      `${FAENAS_BASE_PATH}/${idFaena}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeFaena(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteFaena(
  tenantId: string | number,
  idFaena: string | number,
): Promise<void> {
  try {
    await apiClient.delete(`${FAENAS_BASE_PATH}/${idFaena}`, createTenantConfig(tenantId));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
