import axios, { type AxiosResponse } from 'axios';
import { apiClient } from '../../../api/axios';
import type {
  Bien,
  BienApiShape,
  BienCreateDto,
  BienesListEnvelope,
  BienesListResponse,
  BienListQuery,
  BienUpdateDto,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveBienesBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/bienes';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/bienes' : '/api/bienes';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, '')) ? '/bienes' : '/api/bienes';
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

function normalizeBien(raw: BienApiShape): Bien {
  return {
    idBien: raw.idBien ?? raw.id_bien ?? '',
    idTenant: raw.idTenant ?? raw.id_tenant ?? '',
    descripcion: raw.descripcion ?? raw.descripcion_bien ?? '',
    tipo: raw.tipo ?? null,
    cantidad: normalizeNumber(raw.cantidad),
    valorEstimado: raw.valorEstimado === null || raw.valor_estimado === null
      ? null
      : normalizeNumber(raw.valorEstimado ?? raw.valor_estimado),
    ubicacion: raw.ubicacion ?? null,
    fechaAlta: raw.fechaAlta ?? raw.fecha_alta ?? '',
    fechaBaja: raw.fechaBaja ?? raw.fecha_baja ?? null,
    estado: raw.estado ?? 'BUENO',
    observaciones: raw.observaciones ?? null,
  };
}

function normalizePayload(payload: BienCreateDto | BienUpdateDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };

  assign('descripcion', payload.descripcion?.trim());
  if (payload.tipo !== undefined) {
    assign('tipo', payload.tipo?.trim() || null);
  }
  assign('cantidad', payload.cantidad);
  assign('valorEstimado', payload.valorEstimado);
  if (payload.ubicacion !== undefined) {
    assign('ubicacion', payload.ubicacion?.trim() || null);
  }
  assign('fechaAlta', payload.fechaAlta);
  if (payload.fechaBaja !== undefined) {
    assign('fechaBaja', payload.fechaBaja || null);
  }
  assign('estado', payload.estado);
  if (payload.observaciones !== undefined) {
    assign('observaciones', payload.observaciones?.trim() || null);
  }

  return normalizedPayload;
}

function extractItems(data: BienesListEnvelope): BienApiShape[] {
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
  response: AxiosResponse<BienesListEnvelope>,
  page: number,
  pageSize: number,
  length: number,
) {
  const totalHeader = response.headers['x-total-count'];
  const parsed = Number(totalHeader);

  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }

  if (length < pageSize) {
    return (page - 1) * pageSize + length;
  }

  return page * pageSize + 1;
}

function buildListParams(query: BienListQuery) {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
  };

  const search = query.search?.trim();
  const tipo = query.tipo?.trim();

  if (search) {
    params.search = search;
  }

  if (tipo) {
    params.tipo = tipo;
  }

  if (query.estado && query.estado !== 'TODOS') {
    params.estado = query.estado;
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

  return 'No se pudo completar la operación de bienes.';
}

const BIENES_BASE_PATH = resolveBienesBasePath();

export async function getBienes(
  tenantId: string | number,
  query: BienListQuery,
  signal?: AbortSignal,
): Promise<BienesListResponse> {
  try {
    const response = await apiClient.get<BienesListEnvelope>(BIENES_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });
    const items = extractItems(response.data).map(normalizeBien);

    return {
      items,
      total: parseTotal(response, query.page, query.pageSize, items.length),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getBienById(
  tenantId: string | number,
  idBien: string | number,
  signal?: AbortSignal,
): Promise<Bien> {
  try {
    const response = await apiClient.get<BienApiShape>(`${BIENES_BASE_PATH}/${idBien}`, {
      ...createTenantConfig(tenantId, signal),
    });

    return normalizeBien(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createBien(tenantId: string | number, payload: BienCreateDto): Promise<Bien> {
  try {
    const response = await apiClient.post<BienApiShape>(
      BIENES_BASE_PATH,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeBien(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateBien(
  tenantId: string | number,
  idBien: string | number,
  payload: BienUpdateDto,
): Promise<Bien> {
  try {
    const response = await apiClient.patch<BienApiShape>(
      `${BIENES_BASE_PATH}/${idBien}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeBien(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deactivateBien(
  tenantId: string | number,
  idBien: string | number,
): Promise<Bien | null> {
  try {
    const response = await apiClient.delete<BienApiShape | undefined>(
      `${BIENES_BASE_PATH}/${idBien}`,
      createTenantConfig(tenantId),
    );

    if (!response.data || typeof response.data !== 'object') {
      return null;
    }

    return normalizeBien(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
