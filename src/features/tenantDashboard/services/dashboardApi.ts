import axios from 'axios';
import { apiClient } from '../../../api/axios';
import type { TenantDashboardKpis, UpcomingEvent } from '../types';

type TenantScopedConfig = {
  headers: {
    'X-Tenant-Id': string;
  };
  signal?: AbortSignal;
};

type DashboardApiShape = Record<string, unknown>;

function resolveDashboardBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/reportes/dashboard';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = /(?:^|\/)api(?:\/|$)/.test(pathname);

    return hasApiInBase ? '/reportes/dashboard' : '/api/reportes/dashboard';
  } catch {
    return /(?:^|\/)api(?:\/|$)/.test(baseUrl.replace(/\/+$/, ''))
      ? '/reportes/dashboard'
      : '/api/reportes/dashboard';
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

function asRecord(value: unknown): DashboardApiShape {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DashboardApiShape)
    : {};
}

function firstRecord(source: DashboardApiShape, keys: string[]): DashboardApiShape {
  for (const key of keys) {
    const value = source[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as DashboardApiShape;
    }
  }

  return {};
}

function firstValue(source: DashboardApiShape, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return undefined;
}

function toNumber(value: unknown): number {
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

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function normalizeUpcomingEvent(value: unknown, type: UpcomingEvent['type']): UpcomingEvent | null {
  const raw = asRecord(value);

  if (Object.keys(raw).length === 0) {
    return null;
  }

  return {
    type,
    title:
      toStringOrNull(firstValue(raw, ['title', 'titulo', 'descripcion', 'temaPrincipal', 'nombre'])) ??
      (type === 'FAENA' ? 'Próxima faena' : 'Próxima asamblea'),
    scheduledAt: toStringOrNull(
      firstValue(raw, ['scheduledAt', 'fechaProgramada', 'fecha_programada', 'fecha']),
    ),
  };
}

function normalizeDashboard(rawValue: unknown): TenantDashboardKpis {
  const raw = asRecord(rawValue);
  const participants = firstRecord(raw, ['participants', 'participantes', 'personas']);
  const cashflow = firstRecord(raw, ['cashflow', 'caja', 'flujoCaja', 'flujo_caja']);
  const pendingFines = firstRecord(raw, ['pendingFines', 'multasPendientes', 'multas_pendientes']);

  const monthlyIncome = toNumber(
    firstValue(cashflow, ['monthlyIncome', 'ingresosMes', 'ingresos_mes', 'totalIngresos']),
  );
  const monthlyExpense = toNumber(
    firstValue(cashflow, ['monthlyExpense', 'gastosMes', 'gastos_mes', 'totalGastos']),
  );
  const balance = firstValue(cashflow, ['balance', 'saldo', 'saldoFinal']);

  return {
    participants: {
      padronado: toNumber(firstValue(participants, ['padronado', 'padronados'])),
      noPadronado: toNumber(
        firstValue(participants, ['noPadronado', 'no_padronado', 'noPadronados', 'no_padronados']),
      ),
      invitado: toNumber(firstValue(participants, ['invitado', 'invitados'])),
    },
    cashflow: {
      monthlyIncome,
      monthlyExpense,
      balance: balance === undefined ? monthlyIncome - monthlyExpense : toNumber(balance),
    },
    nextFaena: normalizeUpcomingEvent(
      firstValue(raw, ['nextFaena', 'proximaFaena', 'proxima_faena']),
      'FAENA',
    ),
    nextAsamblea: normalizeUpcomingEvent(
      firstValue(raw, ['nextAsamblea', 'proximaAsamblea', 'proxima_asamblea']),
      'ASAMBLEA',
    ),
    pendingFines: {
      count: toNumber(firstValue(pendingFines, ['count', 'cantidad', 'total'])),
      amount: toNumber(firstValue(pendingFines, ['amount', 'monto', 'totalMonto', 'total_monto'])),
    },
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

  return 'No se pudo cargar el dashboard de la junta.';
}

const DASHBOARD_BASE_PATH = resolveDashboardBasePath();

export async function getTenantDashboardKpis(
  tenantId: string | number,
  signal?: AbortSignal,
): Promise<TenantDashboardKpis> {
  try {
    const response = await apiClient.get<unknown>(
      DASHBOARD_BASE_PATH,
      createTenantConfig(tenantId, signal),
    );

    return normalizeDashboard(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
