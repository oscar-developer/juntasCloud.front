import axios, { type AxiosResponse } from 'axios';
import { apiClient } from '../../../../api/axios';
import type {
  AnularMovimientoDto,
  CajaMovimiento,
  CajaMovimientoApiShape,
  CajaMovimientoListApiShape,
  CajaMovimientoListItem,
  CajaMovimientosListResponse,
  CajaMovimientosQuery,
  CreateMovimientoDto,
  UpdateMovimientoDto,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

type MovimientosListEnvelope =
  | CajaMovimientoListApiShape[]
  | {
      items?: CajaMovimientoListApiShape[];
      total?: number | string;
      page?: number | string;
      limit?: number | string;
      data?: CajaMovimientoListApiShape[] | { items?: CajaMovimientoListApiShape[] };
      results?: CajaMovimientoListApiShape[];
    };

function resolveCajaMovimientosBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/caja-movimientos';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/caja-movimientos' : '/api/caja-movimientos';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, ''))
      ? '/caja-movimientos'
      : '/api/caja-movimientos';
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

function normalizeNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = normalizeNumber(value);

  return parsed > 0 ? parsed : null;
}

function normalizeMovimiento(raw: CajaMovimientoApiShape): CajaMovimiento {
  return {
    idTenant: normalizeNumber(raw.idTenant),
    idMovimiento: normalizeNumber(raw.idMovimiento),
    fecha: raw.fecha ?? '',
    tipo: raw.tipo ?? 'INGRESO',
    monto: normalizeNumber(raw.monto),
    idCategoriaCaja: normalizeNumber(raw.idCategoriaCaja),
    categoriaNombre: raw.categoriaNombre ?? '',
    idPersona: normalizeNullableNumber(raw.idPersona),
    idFaena: normalizeNullableNumber(raw.idFaena),
    idAsamblea: normalizeNullableNumber(raw.idAsamblea),
    idBien: normalizeNullableNumber(raw.idBien),
    idUser: normalizeNumber(raw.idUser),
    descripcion: raw.descripcion ?? null,
    medioPago: raw.medioPago ?? 'EFECTIVO',
    docReferencia: raw.docReferencia ?? null,
    observaciones: raw.observaciones ?? null,
    createdAt: raw.createdAt ?? '',
    createdByUser: normalizeNumber(raw.createdByUser),
    updatedAt: raw.updatedAt ?? null,
    updatedByUser: raw.updatedByUser ?? null,
    anulado: Boolean(raw.anulado),
    anuladoAt: raw.anuladoAt ?? null,
    anuladoByUser: raw.anuladoByUser ?? null,
    motivoAnulacion: raw.motivoAnulacion ?? null,
  };
}

function normalizeMovimientoListItem(raw: CajaMovimientoListApiShape): CajaMovimientoListItem {
  return {
    idMovimiento: normalizeNumber(raw.idMovimiento),
    fecha: raw.fecha ?? '',
    tipo: raw.tipo ?? 'INGRESO',
    monto: normalizeNumber(raw.monto),
    descripcion: raw.descripcion ?? null,
    medioPago: raw.medioPago ?? null,
    anulado: Boolean(raw.anulado),
  };
}

function normalizePayload(payload: CreateMovimientoDto | UpdateMovimientoDto) {
  const normalizedPayload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value === undefined) {
      return;
    }

    normalizedPayload[key] = value;
  };
  const has = (key: keyof CreateMovimientoDto) =>
    Object.prototype.hasOwnProperty.call(payload, key);

  assign('fecha', payload.fecha);
  assign('tipo', payload.tipo);
  assign('monto', payload.monto);
  assign('idCategoriaCaja', payload.idCategoriaCaja);
  assign('medioPago', payload.medioPago);
  if (has('idPersona')) {
    assign('idPersona', payload.idPersona ?? null);
  }
  if (has('idFaena')) {
    assign('idFaena', payload.idFaena ?? null);
  }
  if (has('idAsamblea')) {
    assign('idAsamblea', payload.idAsamblea ?? null);
  }
  if (has('idBien')) {
    assign('idBien', payload.idBien ?? null);
  }
  if (has('descripcion')) {
    assign('descripcion', payload.descripcion?.trim() || null);
  }
  if (has('docReferencia')) {
    assign('docReferencia', payload.docReferencia?.trim() || null);
  }
  if (has('observaciones')) {
    assign('observaciones', payload.observaciones?.trim() || null);
  }

  return normalizedPayload;
}

function buildListParams(query: CajaMovimientosQuery) {
  const params: Record<string, string | number | boolean> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.from) {
    params.from = query.from;
  }

  if (query.to) {
    params.to = query.to;
  }

  if (query.tipo && query.tipo !== 'TODOS') {
    params.tipo = query.tipo;
  }

  if (query.idCategoriaCaja) {
    params.idCategoriaCaja = query.idCategoriaCaja;
  }

  if (query.medioPago && query.medioPago !== 'TODOS') {
    params.medioPago = query.medioPago;
  }

  if (query.anulado !== undefined && query.anulado !== 'TODOS') {
    params.anulado = query.anulado;
  }

  if (query.idPersona) {
    params.idPersona = query.idPersona;
  }

  if (query.idUser) {
    params.idUser = query.idUser;
  }

  return params;
}

function extractItems(data: MovimientosListEnvelope): CajaMovimientoListApiShape[] {
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

function getBodyTotal(data: MovimientosListEnvelope): number | null {
  if (Array.isArray(data)) {
    return null;
  }

  const rawTotal = data.total;
  const parsed = Number(rawTotal);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseTotal(
  response: AxiosResponse<MovimientosListEnvelope>,
  page: number,
  limit: number,
  length: number,
) {
  const bodyTotal = getBodyTotal(response.data);

  if (bodyTotal !== null) {
    return bodyTotal;
  }

  const totalHeader = response.headers['x-total-count'];
  const parsed = Number(totalHeader);

  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }

  if (length < limit) {
    return (page - 1) * limit + length;
  }

  return page * limit + 1;
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

  return 'No se pudo completar la operación de movimientos de caja.';
}

const CAJA_MOVIMIENTOS_BASE_PATH = resolveCajaMovimientosBasePath();

export function getCajaMovimientoErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export async function getMovimientos(
  tenantId: string | number,
  query: CajaMovimientosQuery,
  signal?: AbortSignal,
): Promise<CajaMovimientosListResponse> {
  try {
    const response = await apiClient.get<MovimientosListEnvelope>(CAJA_MOVIMIENTOS_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: buildListParams(query),
    });
    const items = extractItems(response.data).map(normalizeMovimientoListItem);

    return {
      items,
      total: parseTotal(response, query.page, query.limit, items.length),
      page: Array.isArray(response.data) ? query.page : normalizeNumber(response.data.page) || query.page,
      limit: Array.isArray(response.data) ? query.limit : normalizeNumber(response.data.limit) || query.limit,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMovimientoById(
  tenantId: string | number,
  idMovimiento: string | number,
  signal?: AbortSignal,
): Promise<CajaMovimiento> {
  try {
    const response = await apiClient.get<CajaMovimientoApiShape>(
      `${CAJA_MOVIMIENTOS_BASE_PATH}/${idMovimiento}`,
      createTenantConfig(tenantId, signal),
    );

    return normalizeMovimiento(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createMovimiento(
  tenantId: string | number,
  payload: CreateMovimientoDto,
): Promise<CajaMovimiento> {
  try {
    const response = await apiClient.post<CajaMovimientoApiShape>(
      CAJA_MOVIMIENTOS_BASE_PATH,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeMovimiento(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateMovimiento(
  tenantId: string | number,
  idMovimiento: string | number,
  payload: UpdateMovimientoDto,
): Promise<CajaMovimiento> {
  try {
    const response = await apiClient.patch<CajaMovimientoApiShape>(
      `${CAJA_MOVIMIENTOS_BASE_PATH}/${idMovimiento}`,
      normalizePayload(payload),
      createTenantConfig(tenantId),
    );

    return normalizeMovimiento(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function anularMovimiento(
  tenantId: string | number,
  idMovimiento: string | number,
  payload: AnularMovimientoDto,
): Promise<CajaMovimiento> {
  try {
    const response = await apiClient.post<CajaMovimientoApiShape>(
      `${CAJA_MOVIMIENTOS_BASE_PATH}/${idMovimiento}/anular`,
      { motivoAnulacion: payload.motivoAnulacion.trim() },
      createTenantConfig(tenantId),
    );

    return normalizeMovimiento(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
