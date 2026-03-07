import { request } from '../../../shared/api/httpClient';
import type { ReceivedInvitation } from '../types';

export function getReceivedInvitations(signal?: AbortSignal): Promise<ReceivedInvitation[]> {
  return request<ReceivedInvitation[]>({
    path: '/me/invitations',
    method: 'GET',
    signal,
  });
}

export function acceptInvitation(invitationId: string | number): Promise<ReceivedInvitation> {
  return request<ReceivedInvitation>({
    path: `/me/invitations/${invitationId}/accept`,
    method: 'POST',
  });
}

export function rejectInvitation(invitationId: string | number): Promise<ReceivedInvitation> {
  return request<ReceivedInvitation>({
    path: `/me/invitations/${invitationId}/reject`,
    method: 'POST',
  });
}
