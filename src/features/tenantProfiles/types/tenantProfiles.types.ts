export type AccessLevel = 'SIN_ACCESO' | 'SOLO_LECTURA' | 'ACCESO_TOTAL';

export type TenantProfileStatusFilter = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

export type AppModule = {
  moduleCode: string;
  nombre: string;
  grupo: string;
  orden: number;
  activo: boolean;
};

export type TenantProfileModule = {
  idTenant?: number | string;
  idProfile?: number | string;
  moduleCode: string;
  nombre: string;
  grupo: string;
  orden: number;
  activo?: boolean;
  accessLevel: AccessLevel;
};

export type TenantProfile = {
  idTenant: number | string;
  idProfile: number | string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  totalModules: number;
  totalAccess: number;
  totalReadOnly: number;
  totalNoAccess: number;
  modules?: TenantProfileModule[];
};

export type TenantProfileModuleConfig = {
  moduleCode: string;
  accessLevel: AccessLevel;
};

export type TenantProfileCreateDto = {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  modules?: TenantProfileModuleConfig[];
};

export type TenantProfileUpdateDto = {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type ReplaceTenantProfileModulesDto = {
  modules: TenantProfileModuleConfig[];
};

export type UpdateTenantUserProfileDto = {
  id_profile: number | string;
};

export type TenantProfileListQuery = {
  search: string;
  activo: TenantProfileStatusFilter;
  page: number;
  limit: number;
};

export type TenantProfilesListResponse = {
  items: TenantProfile[];
  total: number;
};

export type TenantProfileFormMode = 'create' | 'edit';
