import axios from 'axios';
import { apiClient } from '../../../../api/axios';
import type {
  ConceptoCobro,
  ConceptoCobroApiShape,
  ConceptoCobroCreateDto,
  ConceptoCobroListQuery,
  ConceptoCobroUpdateDto,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveConceptosCobroBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/conceptos-cobro';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/conceptos-cobro' : '/api/conceptos-cobro';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, ''))
      ? '/conceptos-cobro'
      : '/api/conceptos-cobro';
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

function normalizeConceptoCobro(raw: ConceptoCobroApiShape): ConceptoCobro {
  return {
    idTenant: raw.idTenant,
    idConceptoCobro: raw.idConceptoCobro,
    nombre: raw.nombre ?? '',
    tipo: raw.tipo,
    activo: Boolean(raw.activo),
    requierePeriodo: Boolean(raw.requierePeriodo),
    observaciones: raw.observaciones ?? null,
  };
}

function normalizePayload(payload: ConceptoCobroCreateDto | ConceptoCobroUpdateDto) {
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
  assign('requierePeriodo', payload.requierePeriodo);
  if (payload.observaciones !== undefined) {
    assign('observaciones', payload.observaciones?.trim() || null);
  }

  return normalizedPayload;
}

function buildListParams(query: ConceptoCobroListQuery) {
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

  if (query.requierePeriodo !== undefined && query.requierePeriodo !== 'TODOS') {
    params.requierePeriodo = query.requierePeriodo;
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

  return 'No se pudo completar la operación de conceptos de cobro.';
}

const CONCEPTOS_COBRO_BASE_PATH = resolveConceptosCobroBasePath();

export async function getConceptosCobro(
  tenantId: string | number,
  query: ConceptoCobroListQuery,
  signal?: AbortSignal,
): Promise<ConceptoCobro[]> {
  try {
    const response = await apiClient.get<ConceptoCobroApiShape[]>(CONCEPTOS_COBRO_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });

    return response.data.map(normalizeConceptoCobro);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getConceptoCobroById(
  tenantId: string | number,
  idConceptoCobro: string | number,
  signal?: AbortSignal,
): Promise<ConceptoCobro> {
  try {
    const response = await apiClient.get<ConceptoCobroApiShape>(
      `${CONCEPTOS_COBRO_BASE_PATH}/${idConceptoCobro}`,
      createTenantConfig(tenantId, signal),
    );

    return normalizeConceptoCobro(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createConceptoCobro(
  tenantId: string | number,
  payload: ConceptoCobroCreateDto,
): Promise<ConceptoCobro> {
  try {
    const response = await apiClient.post<ConceptoCobroApiShape>(
      CONCEPTOS_COBRO_BASE_PATH,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeConceptoCobro(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateConceptoCobro(
  tenantId: string | number,
  idConceptoCobro: string | number,
  payload: ConceptoCobroUpdateDto,
): Promise<ConceptoCobro> {
  try {
    const response = await apiClient.patch<ConceptoCobroApiShape>(
      `${CONCEPTOS_COBRO_BASE_PATH}/${idConceptoCobro}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeConceptoCobro(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteConceptoCobro(
  tenantId: string | number,
  idConceptoCobro: string | number,
): Promise<void> {
  try {
    await apiClient.delete(`${CONCEPTOS_COBRO_BASE_PATH}/${idConceptoCobro}`, createTenantConfig(tenantId));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
