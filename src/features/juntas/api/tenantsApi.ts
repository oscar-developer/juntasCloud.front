import { request } from '../../../shared/api/httpClient';
import type { CreateTenantPayload, Tenant, UpdateTenantPayload } from './types';

export function getTenants(signal?: AbortSignal): Promise<Tenant[]> {
  return request<Tenant[]>({
    path: '/tenants',
    method: 'GET',
    signal,
  });
}

export function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  return request<Tenant>({
    path: '/tenants',
    method: 'POST',
    body: payload,
  });
}

export function updateTenant(id: string | number, payload: UpdateTenantPayload): Promise<Tenant> {
  return request<Tenant>({
    path: `/tenants/${id}`,
    method: 'PATCH',
    body: payload,
  });
}

export function deleteTenant(id: string | number): Promise<void> {
  return request<void>({
    path: `/tenants/${id}`,
    method: 'DELETE',
  });
}
