export type InvitationRole = 'ADMIN' | 'MEMBER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export type TenantInvitation = {
  idInvitation: number | string;
  idTenant: number | string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  revokedAt?: string | null;
  invitedBy: number | string | null;
  createdAt: string;
};

export type CreateTenantInvitationRequest = {
  email: string;
  role: InvitationRole;
  idProfile?: number | null;
  expiresInDays?: number;
  message?: string | null;
};
