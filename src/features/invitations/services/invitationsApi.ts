import { request } from '../../../shared/api/httpClient';
import type { ReceivedInvitation } from '../types';

export function getReceivedInvitations(signal?: AbortSignal): Promise<ReceivedInvitation[]> {
  return request<ReceivedInvitation[]>({
    path: '/me/invitations',
    method: 'GET',
    signal,
  });
}

function getInvitationToken(invitation: ReceivedInvitation): string {
  const token = invitation.token?.trim();

  if (!token) {
    throw new Error('La API v4 requiere el token de invitación para procesar esta acción.');
  }

  return token;
}

export function acceptInvitation(invitation: ReceivedInvitation): Promise<ReceivedInvitation> {
  return request<ReceivedInvitation>({
    path: '/me/invitations/accept',
    method: 'POST',
    body: { token: getInvitationToken(invitation) },
  });
}

export function rejectInvitation(invitation: ReceivedInvitation): Promise<ReceivedInvitation> {
  return request<ReceivedInvitation>({
    path: '/me/invitations/reject',
    method: 'POST',
    body: { token: getInvitationToken(invitation) },
  });
}
