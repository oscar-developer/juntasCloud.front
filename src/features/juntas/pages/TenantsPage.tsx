import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fab,
  Grid,
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
    <Box sx={{ pt: { xs: 2, md: 0 }, pb: { xs: 10, md: 0 } }}>
      <Container maxWidth="xl" >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                borderColor: 'divider',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 52%, rgba(243,244,246,0.9) 100%)',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 3 } }}>
                <Stack
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  gap={{ xs: 2, md: 3 }}
                >
                  <Box sx={{ width: '100%', minWidth: 0, maxWidth: { md: 820 } }}>                    
                    <Typography
                      sx={{  fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}
                    >
                      Mis juntas
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }} variant="body1">
                      Administra tus accesos globales.
                    </Typography>
                    {loading && <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />}
                  </Box>

                  {isDesktop && (
                    <Box sx={{ flexShrink: 0, minWidth: 0 }}>
                      <Button
                        onClick={handleOpenCreateDialog}
                        startIcon={<AddRoundedIcon />}
                        sx={{ minWidth: 168 }}
                        variant="contained"
                      >
                        Crear junta
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {!loading && tenants.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ maxWidth: 760, mx: 'auto' }}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">Aún no tienes juntas</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, mx: 'auto', maxWidth: 420 }}
                    variant="body2"
                  >
                    Crea tu primera junta para comenzar a gestionar tus espacios.
                  </Typography>
                  <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                    Crear junta
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            tenants.map((tenant) => (
              <Grid key={tenant.idTenant} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
                <TenantCard
                  isDeleting={
                    deleteLoadingId !== null && String(deleteLoadingId) === String(tenant.idTenant)
                  }
                  isOwner={isTenantOwner(tenant)}
                  onDelete={() => handleRequestDelete(tenant)}
                  onEdit={() => handleEditTenant(tenant)}
                  onEnter={() => navigate(`/t/${tenant.idTenant}/dashboard`)}
                  tenant={tenant}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

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
