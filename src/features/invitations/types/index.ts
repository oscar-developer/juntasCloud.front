export type InvitationRole = 'ADMIN' | 'MEMBER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export type ReceivedInvitation = {
  idInvitation: number | string;
  idTenant: number | string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  token?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  revokedAt?: string | null;
  invitedBy: number | string | null;
  createdAt: string;
};
