import { useEffect, useState } from 'react';
import { listAppModules } from '../services/appModules.service';
import type { AppModule } from '../types/tenantProfiles.types';

export function useAppModules(enabled = true) {
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();

    const loadModules = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listAppModules(controller.signal);

        if (!controller.signal.aborted) {
          setModules(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error && loadError.message.trim()
              ? loadError.message
              : 'No se pudieron cargar los módulos de la aplicación.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadModules();

    return () => {
      controller.abort();
    };
  }, [enabled, reloadKey]);

  return {
    modules,
    loading,
    error,
    retry: () => setReloadKey((current) => current + 1),
  };
}
