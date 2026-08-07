import axios from 'axios';
import { apiClient } from '../../../../api/axios';
import type { CajaCategoriaApiShape, CajaCategoriaOption, CajaCategoriasQuery } from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveCajaCategoriasBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/caja-categorias';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/caja-categorias' : '/api/caja-categorias';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? '/caja-categorias' : '/api/caja-categorias';
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

function normalizeCategoria(raw: CajaCategoriaApiShape): CajaCategoriaOption {
  return {
    idCategoriaCaja: normalizeNumber(raw.idCategoriaCaja),
    nombre: raw.nombre ?? '',
    tipo: raw.tipo ?? 'INGRESO',
    activo: Boolean(raw.activo),
  };
}

function buildListParams(query: CajaCategoriasQuery) {
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

const CAJA_CATEGORIAS_BASE_PATH = resolveCajaCategoriasBasePath();

export async function getCajaCategorias(
  tenantId: string | number,
  query: CajaCategoriasQuery,
  signal?: AbortSignal,
): Promise<CajaCategoriaOption[]> {
  try {
    const response = await apiClient.get<CajaCategoriaApiShape[]>(CAJA_CATEGORIAS_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });

    return response.data.map(normalizeCategoria);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
