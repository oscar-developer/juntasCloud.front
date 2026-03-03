export type TenantRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type TenantSummary = {
  idTenant: string | number;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones?: string | null;
  ownerUserId?: string | number | null;
};

export type TenantMembership = {
  tenantId: string | number;
  userId: string | number;
  role: TenantRole;
};
