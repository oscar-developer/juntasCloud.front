import axios from 'axios';
import { apiClient } from '../../../../api/axios';
import type {
  CajaMedioPago,
  CajaMovimientoTipo,
  RendicionCuentasApiShape,
  RendicionCuentasResponse,
} from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

function resolveReportesCajaBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/reportes/rendicion-cuentas';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/reportes/rendicion-cuentas' : '/api/reportes/rendicion-cuentas';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api')
      ? '/reportes/rendicion-cuentas'
      : '/api/reportes/rendicion-cuentas';
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

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeTipo(value: unknown): CajaMovimientoTipo {
  return value === 'GASTO' ? 'GASTO' : 'INGRESO';
}

function normalizeMedioPago(value: unknown): CajaMedioPago {
  const allowed: CajaMedioPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'YAPE', 'PLIN', 'OTRO'];

  return allowed.includes(value as CajaMedioPago) ? (value as CajaMedioPago) : 'OTRO';
}

function normalizeRendicion(raw: RendicionCuentasApiShape): RendicionCuentasResponse {
  return {
    periodo: {
      fechaInicio: normalizeString(raw.periodo?.fechaInicio),
      fechaFin: normalizeString(raw.periodo?.fechaFin),
    },
    resumen: {
      saldoInicial: normalizeNumber(raw.resumen?.saldoInicial),
      totalIngresos: normalizeNumber(raw.resumen?.totalIngresos),
      totalGastos: normalizeNumber(raw.resumen?.totalGastos),
      saldoFinal: normalizeNumber(raw.resumen?.saldoFinal),
    },
    porCategoria: (raw.porCategoria ?? []).map((categoria) => ({
      tipo: normalizeTipo(categoria.tipo),
      categoria: normalizeString(categoria.categoria),
      total: normalizeNumber(categoria.total),
    })),
    detalleMovimientos: (raw.detalleMovimientos ?? []).map((movimiento) => ({
      fecha: normalizeString(movimiento.fecha),
      tipo: normalizeTipo(movimiento.tipo),
      categoria: normalizeString(movimiento.categoria),
      descripcion: normalizeString(movimiento.descripcion),
      monto: normalizeNumber(movimiento.monto),
      medioPago: normalizeMedioPago(movimiento.medioPago),
      docReferencia: normalizeString(movimiento.docReferencia) || null,
    })),
  };
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

  return 'No se pudo completar la operación de reportes de caja.';
}

const REPORTES_CAJA_BASE_PATH = resolveReportesCajaBasePath();

export async function getRendicionCuentas(
  tenantId: string | number,
  idJunta: string | number,
  signal?: AbortSignal,
): Promise<RendicionCuentasResponse> {
  try {
    const response = await apiClient.get<RendicionCuentasApiShape>(REPORTES_CAJA_BASE_PATH, {
      ...createTenantConfig(tenantId, signal),
      params: { idJunta },
    });

    return normalizeRendicion(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
