import { apiClient } from '../../../api/axios';
import type { AsambleaAttendanceApiShape } from './types';

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

function resolveAsistenciaAsambleaBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/asistencia-asamblea';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');
    return hasApiInBase ? '/asistencia-asamblea' : '/api/asistencia-asamblea';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api')
      ? '/asistencia-asamblea'
      : '/api/asistencia-asamblea';
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
const ASISTENCIA_ASAMBLEA_BASE_PATH = resolveAsistenciaAsambleaBasePath();

export async function fetchAsambleaAttendanceList(
  tenantId: string | number,
  idAsamblea: string | number,
  params: Record<string, string | number | boolean>,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<AsambleaAttendanceApiShape[]>(
    `${ASAMBLEAS_BASE_PATH}/${idAsamblea}/asistencias`,
    {
      ...createTenantConfig(tenantId, signal),
      params,
    },
  );

  return response.data;
}

export async function postAsambleaAttendance(
  tenantId: string | number,
  idAsamblea: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.post(
    `${ASAMBLEAS_BASE_PATH}/${idAsamblea}/asistencias`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}

export async function patchAsambleaAttendance(
  tenantId: string | number,
  idAsistencia: string | number,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.patch(
    `${ASISTENCIA_ASAMBLEA_BASE_PATH}/${idAsistencia}`,
    payload,
    createTenantConfig(tenantId),
  );

  return response.data;
}
