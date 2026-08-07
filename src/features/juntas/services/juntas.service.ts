import axios from 'axios';
import { apiClient } from '../../../api/axios';
import type { CreateTenantPayload, Tenant, TenantStatus, UpdateTenantPayload } from '../types';

type GetTenantsOptions = {
  estado?: TenantStatus;
  signal?: AbortSignal;
};

function resolveTenantsBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/tenants';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/tenants' : '/api/tenants';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? '/tenants' : '/api/tenants';
  }
}

const TENANTS_BASE_PATH = resolveTenantsBasePath();

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

  return 'No se pudo completar la operación de juntas.';
}

export async function getTenants(options: GetTenantsOptions = {}): Promise<Tenant[]> {
  try {
    const response = await apiClient.get<Tenant[]>(TENANTS_BASE_PATH, {
      params: {
        estado: options.estado,
      },
      signal: options.signal,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getTenantById(
  tenantId: string | number,
  signal?: AbortSignal,
): Promise<Tenant> {
  try {
    const response = await apiClient.get<Tenant>(`${TENANTS_BASE_PATH}/${tenantId}`, { signal });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  try {
    const response = await apiClient.post<Tenant>(TENANTS_BASE_PATH, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateTenant(
  id: string | number,
  payload: UpdateTenantPayload,
): Promise<Tenant> {
  try {
    const response = await apiClient.patch<Tenant>(`${TENANTS_BASE_PATH}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function sendTenantToTrash(id: string | number): Promise<void> {
  try {
    await apiClient.delete(`${TENANTS_BASE_PATH}/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteTenantPermanently(id: string | number): Promise<void> {
  try {
    await apiClient.delete(`${TENANTS_BASE_PATH}/${id}/permanent`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function restoreTenant(_id: string | number): Promise<void> {
  // Pendiente de backend: conectar a un endpoint como PATCH /tenants/{id}/restore
  // que invoque public.restaurar_tenant(...).
  throw new Error('La restauración de juntas todavía no está disponible en el backend.');
}
