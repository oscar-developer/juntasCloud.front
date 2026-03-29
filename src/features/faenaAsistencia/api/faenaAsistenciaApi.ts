import { apiClient } from '../../../api/axios';
import type { FaenaParticipacionApiShape } from './types';

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
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');
    return hasApiInBase ? '/faenas' : '/api/faenas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/faenas' : '/api/faenas';
  }
}

function resolveFaenaParticipacionesBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/faena-participaciones';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');
    return hasApiInBase ? '/faena-participaciones' : '/api/faena-participaciones';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api')
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

const FAENAS_BASE_PATH = resolveFaenasBasePath();
const FAENA_PARTICIPACIONES_BASE_PATH = resolveFaenaParticipacionesBasePath();

export async function fetchFaenaParticipaciones(
  tenantId: string | number,
  idFaena: string | number,
  params: Record<string, string | number | boolean>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<FaenaParticipacionApiShape[]>(
    `${FAENAS_BASE_PATH}/${idFaena}/participaciones`,
    {
      ...createTenantConfig(tenantId, signal),
      params,
    },
  );

  return response.data;
}

export async function fetchFaenaParticipacionById(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(
    `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}`,
    createTenantConfig(tenantId, signal),
  );

  return response.data;
}

export async function postFaenaParticipacion(
  tenantId: string | number,
  idFaena: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(
    `${FAENAS_BASE_PATH}/${idFaena}/participaciones`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function patchFaenaParticipacion(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function postAnularFaenaParticipacion(
  tenantId: string | number,
  idFaenaParticipacion: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(
    `${FAENA_PARTICIPACIONES_BASE_PATH}/${idFaenaParticipacion}/anular`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}
