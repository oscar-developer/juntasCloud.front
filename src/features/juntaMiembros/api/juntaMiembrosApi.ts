import { apiClient } from '../../../api/axios';
import type { JuntaMiembrosListEnvelope } from './types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveJuntaMiembrosBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/junta-miembros';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/junta-miembros' : '/api/junta-miembros';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api')
      ? '/junta-miembros'
      : '/api/junta-miembros';
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

const JUNTA_MIEMBROS_BASE_PATH = resolveJuntaMiembrosBasePath();

export async function fetchJuntaMiembros(
  tenantId: string | number,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<JuntaMiembrosListEnvelope>(JUNTA_MIEMBROS_BASE_PATH, {
    ...createTenantConfig(tenantId, signal),
    params,
  });

  return response.data;
}

export async function fetchJuntaMiembroById(
  tenantId: string | number,
  idJuntaMiembro: string | number,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(`${JUNTA_MIEMBROS_BASE_PATH}/${idJuntaMiembro}`, {
    ...createTenantConfig(tenantId, signal),
  });

  return response.data;
}

export async function postJuntaMiembro(
  tenantId: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(
    JUNTA_MIEMBROS_BASE_PATH,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function patchJuntaMiembro(
  tenantId: string | number,
  idJuntaMiembro: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${JUNTA_MIEMBROS_BASE_PATH}/${idJuntaMiembro}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function deleteJuntaMiembro(
  tenantId: string | number,
  idJuntaMiembro: string | number,
) {
  await apiClient.delete(`${JUNTA_MIEMBROS_BASE_PATH}/${idJuntaMiembro}`, createTenantConfig(tenantId));
}
