import { apiClient } from '../../../api/axios';
import type { AsambleasListEnvelope } from './types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveAsambleasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/asambleas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');
    return hasApiInBase ? '/asambleas' : '/api/asambleas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/asambleas' : '/api/asambleas';
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

const ASAMBLEAS_BASE_PATH = resolveAsambleasBasePath();

export async function fetchAsambleas(
  tenantId: string | number,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<AsambleasListEnvelope>(ASAMBLEAS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });

  return response.data;
}

export async function fetchAsambleaById(
  tenantId: string | number,
  idAsamblea: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${ASAMBLEAS_BASE_PATH}/${idAsamblea}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postAsamblea(tenantId: string | number, payload: Record<string, unknown>) {
  const response = await apiClient.post(ASAMBLEAS_BASE_PATH, payload, createTenantConfig(tenantId));
  return response.data;
}

export async function patchAsamblea(
  tenantId: string | number,
  idAsamblea: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${ASAMBLEAS_BASE_PATH}/${idAsamblea}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function deleteAsamblea(tenantId: string | number, idAsamblea: string | number) {
  await apiClient.delete(`${ASAMBLEAS_BASE_PATH}/${idAsamblea}`, createTenantConfig(tenantId));
}
