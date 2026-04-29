import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../../shared/auth/authStorage';
import { getUserIdFromToken } from '../../../shared/auth/jwt';
import {
  createTenant,
  deleteTenant,
  getTenants,
  updateTenant,
} from '../services/juntas.service';
import type { CreateTenantPayload, Tenant } from '../types';

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

  return 'No se pudieron cargar las juntas. Inténtalo nuevamente.';
}

export function useJuntas() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  const currentUserId = useMemo(() => getUserIdFromToken(getToken()), []);

  useEffect(() => {
    const controller = new AbortController();

    const loadTenants = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenants(controller.signal);

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

    void loadTenants();

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

  const isTenantOwner = (tenant: Tenant) => {
    return (
      currentUserId !== null &&
      tenant.ownerUserId != null &&
      String(tenant.ownerUserId) === currentUserId
    );
  };

  const openCreateDialog = () => {
    setEditingTenant(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) {
      return;
    }

    setDialogOpen(false);
    setEditingTenant(null);
  };

  const editTenant = (tenant: Tenant) => {
    if (!isTenantOwner(tenant)) {
      return;
    }

    setEditingTenant(tenant);
    setDialogOpen(true);
  };

  const requestDelete = (tenant: Tenant) => {
    if (!isTenantOwner(tenant)) {
      return;
    }

    setDeleteTarget(tenant);
  };

  const closeDeleteDialog = () => {
    if (deleteLoadingId === null) {
      setDeleteTarget(null);
    }
  };

  const submitTenant = async (payload: CreateTenantPayload) => {
    if (editingTenant && (editingTenant.idTenant === undefined || editingTenant.idTenant === null)) {
      showMessage('No se pudo identificar la junta a editar.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (editingTenant) {
        const updatedTenant = await updateTenant(editingTenant.idTenant, payload);
        setTenants((current) =>
          current.map((tenant) =>
            String(tenant.idTenant) === String(updatedTenant.idTenant) ? updatedTenant : tenant,
          ),
        );
        showMessage('Junta actualizada correctamente', 'success');
      } else {
        const createdTenant = await createTenant(payload);
        setTenants((current) => [createdTenant, ...current]);
        showMessage('Junta creada correctamente', 'success');
      }

      setDialogOpen(false);
      setEditingTenant(null);
    } catch (submitError) {
      showMessage(getErrorMessage(submitError), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteLoadingId(deleteTarget.idTenant);

    try {
      await deleteTenant(deleteTarget.idTenant);
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

  const enterTenant = (tenant: Tenant) => {
    navigate(`/app/juntas/${tenant.idTenant}/dashboard`);
  };

  return {
    tenants,
    loading,
    error,
    isDesktop,
    dialogOpen,
    editingTenant,
    submitting,
    deleteTarget,
    deleteLoadingId,
    toast,
    showEmptyState: !loading && tenants.length === 0,
    isTenantOwner,
    openCreateDialog,
    closeDialog,
    editTenant,
    requestDelete,
    closeDeleteDialog,
    submitTenant,
    confirmDelete,
    enterTenant,
    closeToast,
  };
}
