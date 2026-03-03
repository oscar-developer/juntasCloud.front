import { request } from '../../../shared/api/httpClient';
import {
  createTenant,
  deleteTenant,
  getTenants,
  updateTenant,
} from '../api/tenantsApi';
import type { Tenant } from '../types';

export { createTenant, deleteTenant, getTenants, updateTenant };

export function getTenantById(
  tenantId: string | number,
  signal?: AbortSignal,
): Promise<Tenant> {
  return request<Tenant>({
    path: `/tenants/${tenantId}`,
    method: 'GET',
    signal,
  });
}
