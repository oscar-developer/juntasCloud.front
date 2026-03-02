import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HttpError } from '../../../shared/api/httpClient';
import { getToken } from '../../../shared/auth/authStorage';
import { getUserIdFromToken } from '../../../shared/auth/jwt';
import { Toast } from '../../../shared/ui/Toast';
import { deleteTenant, getTenants } from '../api/tenantsApi';
import type { Tenant } from '../api/types';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { TenantCard } from '../components/TenantCard';
import { TenantFormDialog } from '../components/TenantFormDialog';

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
  if (error instanceof HttpError) {
    return error.message;
  }

  return 'No se pudieron cargar las juntas. Inténtalo nuevamente.';
}

export function TenantsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
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

    void loadTenants();

    return () => {
      controller.abort();
    };
  }, []);

  const isTenantOwner = (tenant: Tenant) => {
    return (
      currentUserId !== null &&
      tenant.ownerUserId != null &&
      String(tenant.ownerUserId) === currentUserId
    );
  };

  const handleOpenCreateDialog = () => {
    setEditingTenant(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTenant(null);
  };

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleEditTenant = (tenant: Tenant) => {
    if (!isTenantOwner(tenant)) {
      return;
    }

    setEditingTenant(tenant);
    setDialogOpen(true);
  };

  const handleRequestDelete = (tenant: Tenant) => {
    if (!isTenantOwner(tenant)) {
      return;
    }

    setDeleteTarget(tenant);
  };

  const handleConfirmDelete = async () => {
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
      handleShowMessage('Junta eliminada correctamente', 'success');
    } catch (error) {
      handleShowMessage(getErrorMessage(error), 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 10, md: 2 } }}>
      <Stack
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4">Mis juntas</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body1">
            Administra tus accesos globales y entra a cada junta cuando lo necesites.
          </Typography>
          {loading && <LinearProgress sx={{ mt: 2, borderRadius: 999 }} />}
        </Box>

        {isDesktop && (
          <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
            Crear junta
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && tenants.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Aún no tienes juntas</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Crea tu primera junta para comenzar a gestionar tus espacios.
            </Typography>
            <Button onClick={handleOpenCreateDialog} sx={{ mt: 2 }} variant="contained">
              Crear junta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {tenants.map((tenant) => (
            <TenantCard
              isDeleting={deleteLoadingId !== null && String(deleteLoadingId) === String(tenant.idTenant)}
              isOwner={isTenantOwner(tenant)}
              key={tenant.idTenant}
              onDelete={() => handleRequestDelete(tenant)}
              onEdit={() => handleEditTenant(tenant)}
              onEnter={() => navigate(`/t/${tenant.idTenant}/dashboard`)}
              tenant={tenant}
            />
          ))}
        </Box>
      )}

      {!isDesktop && (
        <Fab
          color="primary"
          onClick={handleOpenCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      <TenantFormDialog
        initialValues={editingTenant ?? undefined}
        mode={editingTenant ? 'edit' : 'create'}
        onClose={handleCloseDialog}
        onCreated={(createdTenant) => {
          setTenants((current) => [createdTenant, ...current]);
        }}
        onUpdated={(updatedTenant) => {
          setTenants((current) =>
            current.map((tenant) =>
              String(tenant.idTenant) === String(updatedTenant.idTenant) ? updatedTenant : tenant,
            ),
          );
        }}
        onShowMessage={handleShowMessage}
        open={dialogOpen}
      />

      <ConfirmDeleteDialog
        loading={
          deleteTarget !== null &&
          deleteLoadingId !== null &&
          String(deleteTarget.idTenant) === String(deleteLoadingId)
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        open={Boolean(deleteTarget)}
        tenantName={deleteTarget?.nombre}
      />

      <Toast
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        open={toast.open}
        severity={toast.severity}
      />
    </Box>
  );
}
