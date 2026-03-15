import type { AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type { BienesListEnvelope } from './types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveBienesBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/bienes';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/bienes' : '/api/bienes';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/bienes' : '/api/bienes';
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

const BIENES_BASE_PATH = resolveBienesBasePath();

export function fetchBienes(
  tenantId: string | number,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<AxiosResponse<BienesListEnvelope>> {
  return apiClient.get<BienesListEnvelope>(BIENES_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });
}

export async function fetchBienById(
  tenantId: string | number,
  idBien: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${BIENES_BASE_PATH}/${idBien}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postBien(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(BIENES_BASE_PATH, payload, createTenantConfig(tenantId));
  return response.data;
}

export async function patchBien(
  tenantId: string | number,
  idBien: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${BIENES_BASE_PATH}/${idBien}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function deleteBien(tenantId: string | number, idBien: string | number) {
  const response = await apiClient.delete(`${BIENES_BASE_PATH}/${idBien}`, createTenantConfig(tenantId));
  return response.data;
}
