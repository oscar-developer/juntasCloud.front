export type InvitationRole = 'ADMIN' | 'MEMBER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export type TenantInvitation = {
  idInvitation: number | string;
  idTenant: number | string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  invitedBy: number | string | null;
  createdAt: string;
};

export type CreateTenantInvitationRequest = {
  email: string;
  role: InvitationRole;
};
