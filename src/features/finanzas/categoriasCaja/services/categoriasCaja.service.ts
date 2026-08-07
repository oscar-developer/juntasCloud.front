import axios from 'axios';
import { apiClient } from '../../../../api/axios';
import type {
  CajaCategoria,
  CajaCategoriaApiShape,
  CajaCategoriaCreateDto,
  CajaCategoriaListQuery,
  CajaCategoriaUpdateDto,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveCategoriasCajaBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/caja-categorias';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/caja-categorias' : '/api/caja-categorias';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, ''))
      ? '/caja-categorias'
      : '/api/caja-categorias';
  }
}

function createTenantConfig(tenantId: string | number, signal?: AbortSignal): TenantScopedConfig {
  return {
    headers: {
      'X-Tenant-Id': String(tenantId),
    },
    signal,
  };
}

function normalizeCategoriaCaja(raw: CajaCategoriaApiShape): CajaCategoria {
  return {
    idTenant: raw.idTenant,
    idCategoriaCaja: raw.idCategoriaCaja,
    nombre: raw.nombre ?? '',
    tipo: raw.tipo,
    activo: Boolean(raw.activo),
  };
}

function normalizePayload(payload: CajaCategoriaCreateDto | CajaCategoriaUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('nombre', payload.nombre?.trim());
  assign('tipo', payload.tipo);
  assign('activo', payload.activo);

  return normalizedPayload;
}

function buildListParams(query: CajaCategoriaListQuery) {
  const params: Record<string, string | boolean> = {};
  const search = query.search?.trim();

  if (search) {
    params.search = search;
  }

  if (query.tipo && query.tipo !== 'TODOS') {
    params.tipo = query.tipo;
  }

  if (query.activo !== undefined && query.activo !== 'TODOS') {
    params.activo = query.activo;
  }

  return params;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === 'object') {
      const candidate = responseData as { message?: string; error?: string };

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

  return 'No se pudo completar la operación de categorías de caja.';
}

const CATEGORIAS_CAJA_BASE_PATH = resolveCategoriasCajaBasePath();

export async function getCategoriasCaja(
  tenantId: string | number,
  query: CajaCategoriaListQuery,
  signal?: AbortSignal,
): Promise<CajaCategoria[]> {
  try {
    const response = await apiClient.get<CajaCategoriaApiShape[]>(CATEGORIAS_CAJA_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });

    return response.data.map(normalizeCategoriaCaja);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCategoriaCajaById(
  tenantId: string | number,
  idCategoriaCaja: string | number,
  signal?: AbortSignal,
): Promise<CajaCategoria> {
  try {
    const response = await apiClient.get<CajaCategoriaApiShape>(
      `${CATEGORIAS_CAJA_BASE_PATH}/${idCategoriaCaja}`,
      createTenantConfig(tenantId, signal),
    );

    return normalizeCategoriaCaja(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createCategoriaCaja(
  tenantId: string | number,
  payload: CajaCategoriaCreateDto,
): Promise<CajaCategoria> {
  try {
    const response = await apiClient.post<CajaCategoriaApiShape>(
      CATEGORIAS_CAJA_BASE_PATH,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeCategoriaCaja(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateCategoriaCaja(
  tenantId: string | number,
  idCategoriaCaja: string | number,
  payload: CajaCategoriaUpdateDto,
): Promise<CajaCategoria> {
  try {
    const response = await apiClient.patch<CajaCategoriaApiShape>(
      `${CATEGORIAS_CAJA_BASE_PATH}/${idCategoriaCaja}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeCategoriaCaja(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteCategoriaCaja(
  tenantId: string | number,
  idCategoriaCaja: string | number,
): Promise<void> {
  try {
    await apiClient.delete(`${CATEGORIAS_CAJA_BASE_PATH}/${idCategoriaCaja}`, createTenantConfig(tenantId));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
