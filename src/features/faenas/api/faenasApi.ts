import { apiClient } from '../../../api/axios';
import type { FaenasListEnvelope } from './types';

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

const FAENAS_BASE_PATH = resolveFaenasBasePath();

export async function fetchFaenas(
  tenantId: string | number,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<FaenasListEnvelope>(FAENAS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });

  return response.data;
}

export async function fetchFaenaById(
  tenantId: string | number,
  idFaena: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${FAENAS_BASE_PATH}/${idFaena}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postFaena(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(FAENAS_BASE_PATH, payload, createTenantConfig(tenantId));
  return response.data;
}

export async function patchFaena(
  tenantId: string | number,
  idFaena: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${FAENAS_BASE_PATH}/${idFaena}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function deleteFaena(tenantId: string | number, idFaena: string | number) {
  await apiClient.delete(`${FAENAS_BASE_PATH}/${idFaena}`, createTenantConfig(tenantId));
}
