import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTenant } from '../../tenant/context/TenantContext';
import { KpiCards } from '../components/KpiCards';
import { getTenantDashboardKpis } from '../services/dashboardApi';
import type { TenantDashboardKpis } from '../types';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo cargar el dashboard de la junta.';
}

export function TenantDashboardPage() {
  const { loading: tenantLoading, tenant, tenantId } = useTenant();
  const [kpis, setKpis] = useState<TenantDashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const controller = new AbortController();

    const loadKpis = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenantDashboardKpis(tenantId, controller.signal);

        if (!controller.signal.aborted) {
          setKpis(response);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadKpis();

    return () => {
      controller.abort();
    };
  }, [reloadKey, tenantId]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800, lineHeight: 1.04 }}>
          Dashboard de la junta
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Resumen operativo y financiero de {tenant?.nombre ?? 'la junta'} con los indicadores del tenant activo.
        </Typography>
      </Box>

      {error && (
        <Alert
          action={
            <Button color="inherit" onClick={() => setReloadKey((current) => current + 1)} size="small">
              Reintentar
            </Button>
          }
          severity="error"
        >
          {error}
        </Alert>
      )}

      <KpiCards data={kpis} loading={tenantLoading || loading} />
    </Stack>
  );
}
