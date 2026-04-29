import axios, { type AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  AccessLevel,
  ReplaceTenantProfileModulesDto,
  TenantProfile,
  TenantProfileCreateDto,
  TenantProfileListQuery,
  TenantProfileModule,
  TenantProfilesListResponse,
  TenantProfileUpdateDto,
  UpdateTenantUserProfileDto,
} from '../types/tenantProfiles.types';

type TenantScopedConfig = {
  signal?: AbortSignal;
};

type TenantProfilesListEnvelope =
  | TenantProfileApiShape[]
  | {
      items?: TenantProfileApiShape[];
      results?: TenantProfileApiShape[];
      data?: TenantProfileApiShape[] | { items?: TenantProfileApiShape[] };
      total?: number | string;
    };

type TenantProfileApiShape = Partial<TenantProfile> & {
  id_tenant?: number | string;
  id_profile?: number | string;
  created_at?: string | null;
  updated_at?: string | null;
  total_modules?: number | string;
  total_access?: number | string;
  total_read_only?: number | string;
  total_no_access?: number | string;
  modules?: TenantProfileModuleApiShape[];
};

type TenantProfileModuleApiShape = Partial<TenantProfileModule> & {
  id_tenant?: number | string;
  id_profile?: number | string;
  module_code?: string;
  access_level?: AccessLevel;
};

const DELETE_CONFLICT_MESSAGE =
  'No se puede eliminar el perfil porque está asignado a uno o más usuarios.';

function resolveApiPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return `/api${normalizedPath}`;
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? normalizedPath : `/api${normalizedPath}`;
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? normalizedPath : `/api${normalizedPath}`;
  }
}

function createConfig(signal?: AbortSignal): TenantScopedConfig {
  return { signal };
}

function normalizeNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function normalizeText(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.trim();

    return normalized || null;
  }

  return null;
}

function normalizeModule(raw: TenantProfileModuleApiShape): TenantProfileModule {
  return {
    idTenant: raw.idTenant ?? raw.id_tenant,
    idProfile: raw.idProfile ?? raw.id_profile,
    moduleCode: raw.moduleCode ?? raw.module_code ?? '',
    nombre: raw.nombre ?? '',
    grupo: raw.grupo ?? 'General',
    orden: normalizeNumber(raw.orden),
    activo: raw.activo ?? true,
    accessLevel: raw.accessLevel ?? raw.access_level ?? 'SIN_ACCESO',
  };
}

function normalizeProfile(raw: TenantProfileApiShape): TenantProfile {
  return {
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    idProfile: raw.idProfile ?? raw.id_profile ?? '',
    nombre: raw.nombre ?? '',
    descripcion: normalizeText(raw.descripcion),
    activo: raw.activo ?? true,
    createdAt: normalizeText(raw.createdAt ?? raw.created_at),
    updatedAt: normalizeText(raw.updatedAt ?? raw.updated_at),
    totalModules: normalizeNumber(raw.totalModules ?? raw.total_modules),
    totalAccess: normalizeNumber(raw.totalAccess ?? raw.total_access),
    totalReadOnly: normalizeNumber(raw.totalReadOnly ?? raw.total_read_only),
    totalNoAccess: normalizeNumber(raw.totalNoAccess ?? raw.total_no_access),
    modules: Array.isArray(raw.modules) ? raw.modules.map(normalizeModule) : undefined,
  };
}

function extractItems(data: TenantProfilesListEnvelope): TenantProfileApiShape[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (data.data && typeof data.data === 'object' && Array.isArray(data.data.items)) {
    return data.data.items;
  }

  return [];
}

function parseTotal(
  response: AxiosResponse<TenantProfilesListEnvelope>,
  page: number,
  limit: number,
  length: number,
) {
  const totalHeader = response.headers['x-total-count'];
  const parsedHeader = Number(totalHeader);

  if (Number.isFinite(parsedHeader) && parsedHeader >= 0) {
    return parsedHeader;
  }

  const responseData = response.data;

  if (!Array.isArray(responseData) && responseData.total !== undefined) {
    const parsedTotal = Number(responseData.total);

    if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
      return parsedTotal;
    }
  }

  if (length < limit) {
    return (page - 1) * limit + length;
  }

  return page * limit + 1;
}

function buildListParams(query: TenantProfileListQuery) {
  const params: Record<string, string | number | boolean> = {
    page: query.page,
    limit: query.limit,
  };

  const search = query.search.trim();

  if (search) {
    params.search = search;
  }

  if (query.activo === 'ACTIVOS') {
    params.activo = true;
  }

  if (query.activo === 'INACTIVOS') {
    params.activo = false;
  }

  return params;
}

function normalizeProfilePayload(payload: TenantProfileCreateDto | TenantProfileUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  if (payload.nombre !== undefined) {
    normalizedPayload.nombre = payload.nombre.trim();
  }

  if (payload.descripcion !== undefined) {
    const descripcion = payload.descripcion?.trim() ?? '';
    normalizedPayload.descripcion = descripcion || null;
  }

  if (payload.activo !== undefined) {
    normalizedPayload.activo = payload.activo;
  }

  if ('modules' in payload && payload.modules !== undefined) {
    normalizedPayload.modules = payload.modules;
  }

  return normalizedPayload;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === 'object') {
      const candidate = responseData as { message?: string | string[]; error?: string };

      if (Array.isArray(candidate.message) && candidate.message.length > 0) {
        return candidate.message.join(' ');
      }

      if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message;
      }

      if (typeof candidate.error === 'string' && candidate.error.trim()) {
        return candidate.error;
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getTenantProfileErrorMessage(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export function getTenantProfileDeleteErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return DELETE_CONFLICT_MESSAGE;
  }

  return getErrorMessage(error, 'No se pudo eliminar el perfil.');
}

const TENANT_PROFILES_BASE_PATH = resolveApiPath('/tenants');

export async function listTenantProfiles(
  tenantId: string | number,
  query: TenantProfileListQuery,
  signal?: AbortSignal,
): Promise<TenantProfilesListResponse> {
  try {
    const response = await apiClient.get<TenantProfilesListEnvelope>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles`,
      {
        ...createConfig(signal),
        params: buildListParams(query),
      },
    );
    const items = extractItems(response.data).map(normalizeProfile);

    return {
      items,
      total: parseTotal(response, query.page, query.limit, items.length),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudieron cargar los perfiles.'));
  }
}

export async function getTenantProfile(
  tenantId: string | number,
  id: string | number,
  signal?: AbortSignal,
): Promise<TenantProfile> {
  try {
    const response = await apiClient.get<TenantProfileApiShape>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles/${id}`,
      createConfig(signal),
    );

    return normalizeProfile(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo cargar el perfil.'));
  }
}

export async function createTenantProfile(
  tenantId: string | number,
  payload: TenantProfileCreateDto,
): Promise<TenantProfile> {
  try {
    const response = await apiClient.post<TenantProfileApiShape>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles`,
      normalizeProfilePayload(payload),
    );

    return normalizeProfile(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo crear el perfil.'));
  }
}

export async function updateTenantProfile(
  tenantId: string | number,
  id: string | number,
  payload: TenantProfileUpdateDto,
): Promise<TenantProfile> {
  try {
    const response = await apiClient.put<TenantProfileApiShape>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles/${id}`,
      normalizeProfilePayload(payload),
    );

    return normalizeProfile(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo actualizar el perfil.'));
  }
}

export async function deleteTenantProfile(
  tenantId: string | number,
  id: string | number,
): Promise<void> {
  try {
    await apiClient.delete(`${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles/${id}`);
  } catch (error) {
    throw new Error(getTenantProfileDeleteErrorMessage(error));
  }
}

export async function getTenantProfileModules(
  tenantId: string | number,
  profileId: string | number,
  signal?: AbortSignal,
): Promise<TenantProfileModule[]> {
  try {
    const response = await apiClient.get<TenantProfileModuleApiShape[]>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles/${profileId}/modules`,
      createConfig(signal),
    );

    return Array.isArray(response.data) ? response.data.map(normalizeModule) : [];
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudieron cargar los permisos del perfil.'));
  }
}

export async function replaceTenantProfileModules(
  tenantId: string | number,
  profileId: string | number,
  payload: ReplaceTenantProfileModulesDto,
): Promise<TenantProfileModule[]> {
  try {
    const response = await apiClient.put<TenantProfileModuleApiShape[]>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/profiles/${profileId}/modules`,
      payload,
    );

    return Array.isArray(response.data) ? response.data.map(normalizeModule) : [];
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo guardar la configuración de permisos.'));
  }
}

export async function updateTenantUserProfile(
  tenantId: string | number,
  userId: string | number,
  payload: UpdateTenantUserProfileDto,
): Promise<TenantProfile> {
  try {
    const response = await apiClient.patch<TenantProfileApiShape>(
      `${TENANT_PROFILES_BASE_PATH}/${tenantId}/users/${userId}/profile`,
      payload,
    );

    return normalizeProfile(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo actualizar el perfil del usuario.'));
  }
}
