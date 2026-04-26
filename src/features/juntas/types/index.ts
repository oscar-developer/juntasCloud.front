export type TenantStatus = 'ACTIVO' | 'INACTIVO';
export type TenantDocumentType = 'RUC' | 'DNI' | 'OTRO';

export type Tenant = {
  idTenant: string | number;
  nombre: string;
  tipoDocumento?: TenantDocumentType | null;
  numeroDocumento?: string | null;
  estado: TenantStatus;
  createdAt?: string;
  observaciones?: string | null;
  ownerUserId?: string | number | null;
};

export type CreateTenantPayload = {
  nombre: string;
  tipoDocumento: TenantDocumentType;
  numeroDocumento: string;
  estado: TenantStatus;
  observaciones?: string;
};

export type UpdateTenantPayload = {
  nombre: string;
  tipoDocumento: TenantDocumentType;
  numeroDocumento: string;
  estado: TenantStatus;
  observaciones?: string;
};
