import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { deleteTenantPermanently, getTenants } from '../services/juntas.service';
import type { Tenant } from '../types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

const initialToastState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudieron cargar las juntas en papelera. Inténtalo nuevamente.';
}

export function useTenantTrash() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    const controller = new AbortController();

    const loadTrash = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenants({ estado: 'INACTIVO', signal: controller.signal });

        if (!controller.signal.aborted) {
          setTenants(response);
        }
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }

        setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadTrash();

    return () => {
      controller.abort();
    };
  }, []);

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const requestPermanentDelete = (tenant: Tenant) => {
    setDeleteTarget(tenant);
  };

  const closePermanentDeleteDialog = () => {
    if (deleteLoadingId === null) {
      setDeleteTarget(null);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteLoadingId(deleteTarget.idTenant);

    try {
      await deleteTenantPermanently(deleteTarget.idTenant);
      setTenants((current) =>
        current.filter((tenant) => String(tenant.idTenant) !== String(deleteTarget.idTenant)),
      );
      setDeleteTarget(null);
      showMessage('Junta eliminada permanentemente', 'success');
    } catch (deleteError) {
      showMessage(getErrorMessage(deleteError), 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return {
    tenants,
    loading,
    error,
    isDesktop,
    deleteTarget,
    deleteLoadingId,
    toast,
    showEmptyState: !loading && tenants.length === 0,
    requestPermanentDelete,
    closePermanentDeleteDialog,
    confirmPermanentDelete,
    closeToast,
  };
}
