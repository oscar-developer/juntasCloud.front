import { request } from '../../../shared/api/httpClient';
import type { CreateTenantInvitationRequest, TenantInvitation } from '../types';

export function getTenantInvitations(
  tenantId: string | number,
  signal?: AbortSignal,
): Promise<TenantInvitation[]> {
  return request<TenantInvitation[]>({
    path: `/tenants/${tenantId}/invitations`,
    method: 'GET',
    signal,
  });
}

export function createTenantInvitation(
  tenantId: string | number,
  payload: CreateTenantInvitationRequest,
): Promise<TenantInvitation> {
  return request<TenantInvitation>({
    path: `/tenants/${tenantId}/invitations`,
    method: 'POST',
    body: payload,
  });
}
