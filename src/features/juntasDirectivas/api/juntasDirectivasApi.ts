import { apiClient } from '../../../api/axios';
import type { JuntasDirectivasListEnvelope } from './types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveJuntasDirectivasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/juntas-directivas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/juntas-directivas' : '/api/juntas-directivas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api')
      ? '/juntas-directivas'
      : '/api/juntas-directivas';
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

const JUNTAS_DIRECTIVAS_BASE_PATH = resolveJuntasDirectivasBasePath();

export async function fetchJuntasDirectivas(
  tenantId: string | number,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<JuntasDirectivasListEnvelope>(JUNTAS_DIRECTIVAS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });

  return response.data;
}

export async function fetchJuntaDirectivaById(
  tenantId: string | number,
  idJunta: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${JUNTAS_DIRECTIVAS_BASE_PATH}/${idJunta}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postJuntaDirectiva(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(
    JUNTAS_DIRECTIVAS_BASE_PATH,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function patchJuntaDirectiva(
  tenantId: string | number,
  idJunta: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${JUNTAS_DIRECTIVAS_BASE_PATH}/${idJunta}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function deleteJuntaDirectiva(
  tenantId: string | number,
  idJunta: string | number,
) {
  await apiClient.delete(`${JUNTAS_DIRECTIVAS_BASE_PATH}/${idJunta}`, createTenantConfig(tenantId));
}
