export type TenantStatus = 'ACTIVO' | 'INACTIVO';

export type Tenant = {
  idTenant: string | number;
  nombre: string;
  ruc?: string | null;
  dni?: string | null;
  estado: TenantStatus;
  createdAt?: string;
  observaciones?: string | null;
  ownerUserId?: string | number | null;
};

export type CreateTenantPayload = {
  nombre: string;
  ruc?: string;
  dni?: string;
  estado: TenantStatus;
  observaciones?: string;
};

export type UpdateTenantPayload = {
  nombre: string;
  ruc?: string;
  dni?: string;
  estado: TenantStatus;
  observaciones?: string;
};
