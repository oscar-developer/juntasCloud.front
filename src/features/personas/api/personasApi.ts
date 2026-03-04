import type { AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type { PersonasListEnvelope } from './types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolvePersonasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/personas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/personas' : '/api/personas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/personas' : '/api/personas';
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

const PERSONAS_BASE_PATH = resolvePersonasBasePath();

export function fetchPersonas(
  tenantId: string | number,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<AxiosResponse<PersonasListEnvelope>> {
  return apiClient.get<PersonasListEnvelope>(PERSONAS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });
}

export async function fetchPersonaById(
  tenantId: string | number,
  idPersona: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${PERSONAS_BASE_PATH}/${idPersona}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postPersona(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(PERSONAS_BASE_PATH, payload, createTenantConfig(tenantId));
  return response.data;
}

export async function patchPersona(
  tenantId: string | number,
  idPersona: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${PERSONAS_BASE_PATH}/${idPersona}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export function deletePersona(tenantId: string | number, idPersona: string | number) {
  return apiClient.delete(`${PERSONAS_BASE_PATH}/${idPersona}`, createTenantConfig(tenantId));
}
