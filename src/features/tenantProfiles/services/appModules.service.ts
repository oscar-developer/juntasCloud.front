import axios from 'axios';
import { apiClient } from '../../../api/axios';
import type { AppModule } from '../types/tenantProfiles.types';

type AppModuleApiShape = Partial<AppModule> & {
  module_code?: string;
};

function resolveAppModulesBasePath() {
  const baseUrl = apiClient.defaults.baseURL?.trim() ?? '';

  if (!baseUrl) {
    return '/api/app-modules';
  }

  try {
    const pathname = new URL(baseUrl).pathname.replace(/\/+$/, '');
    const hasApiInBase = pathname === '/api' || pathname.endsWith('/api');

    return hasApiInBase ? '/app-modules' : '/api/app-modules';
  } catch {
    return baseUrl.replace(/\/+$/, '').endsWith('/api') ? '/app-modules' : '/api/app-modules';
  }
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

function normalizeAppModule(raw: AppModuleApiShape): AppModule {
  return {
    moduleCode: raw.moduleCode ?? raw.module_code ?? '',
    nombre: raw.nombre ?? '',
    grupo: raw.grupo ?? 'General',
    orden: normalizeNumber(raw.orden),
    activo: raw.activo ?? true,
  };
}

function getErrorMessage(error: unknown) {
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

  return 'No se pudieron cargar los módulos de la aplicación.';
}

const APP_MODULES_BASE_PATH = resolveAppModulesBasePath();

export async function listAppModules(signal?: AbortSignal): Promise<AppModule[]> {
  try {
    const response = await apiClient.get<AppModuleApiShape[]>(APP_MODULES_BASE_PATH, { signal });
    const modules = Array.isArray(response.data) ? response.data.map(normalizeAppModule) : [];

    return modules.sort((left, right) => {
      const groupCompare = left.grupo.localeCompare(right.grupo, 'es');

      if (groupCompare !== 0) {
        return groupCompare;
      }

      return left.orden - right.orden || left.nombre.localeCompare(right.nombre, 'es');
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
