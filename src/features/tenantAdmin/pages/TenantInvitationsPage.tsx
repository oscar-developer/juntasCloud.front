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
import { useEffect, useState } from 'react';
import { HttpError } from '../../../shared/api/httpClient';
import { Toast } from '../../../shared/ui/Toast';
import { useTenant } from '../../tenant/context/TenantContext';
import { TenantInvitationFormDialog } from '../components/TenantInvitationFormDialog';
import { TenantInvitationsMobileList } from '../components/TenantInvitationsMobileList';
import { TenantInvitationsTable } from '../components/TenantInvitationsTable';
import { createTenantInvitation, getTenantInvitations } from '../services/tenantAdminApi';
import type { CreateTenantInvitationRequest, TenantInvitation } from '../types';

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

function sortInvitations(rows: TenantInvitation[]) {
  return [...rows].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function getLoadErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return 'No se pudieron cargar las invitaciones. Inténtalo nuevamente.';
}

function getCreateErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo crear la invitación. Inténtalo nuevamente.';
}

export function TenantInvitationsPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { tenantId, tenant, isAdmin, loading: tenantLoading } = useTenant();
  const [rows, setRows] = useState<TenantInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    if (!tenantId || tenantLoading || !isAdmin) {
      return;
    }

    const controller = new AbortController();

    const loadInvitations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTenantInvitations(tenantId, controller.signal);

        if (!controller.signal.aborted) {
          setRows(sortInvitations(response));
        }
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }

        setError(getLoadErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadInvitations();

    return () => {
      controller.abort();
    };
  }, [isAdmin, reloadKey, tenantId, tenantLoading]);

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleOpenDialog = () => {
    setCreateErrorMessage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (createLoading) {
      return;
    }

    setDialogOpen(false);
    setCreateErrorMessage(null);
  };

  const handleCreateInvitation = async (payload: CreateTenantInvitationRequest) => {
    if (!tenantId) {
      setCreateErrorMessage('No se pudo identificar la junta activa.');
      return;
    }

    setCreateLoading(true);
    setCreateErrorMessage(null);

    try {
      const createdInvitation = await createTenantInvitation(tenantId, payload);

      setRows((current) => sortInvitations([createdInvitation, ...current]));
      setDialogOpen(false);
      handleShowMessage('Invitación creada correctamente.', 'success');
    } catch (createError) {
      setCreateErrorMessage(getCreateErrorMessage(createError));
    } finally {
      setCreateLoading(false);
    }
  };

  const showLoadingState = tenantLoading || loading;
  const showEmptyState = !showLoadingState && !error && rows.length === 0;

  return (
    <Box sx={{ pt: { xs: 2, md: 0 }, pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
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
                <Typography sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}>
                  Invitaciones
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }} variant="body1">
                  Revisa y crea invitaciones para {tenant?.nombre ?? 'la junta activa'}.
                </Typography>
                {showLoadingState && (
                  <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />
                )}
              </Box>

              {isAdmin && isDesktop && (
                <Box sx={{ flexShrink: 0, minWidth: 0 }}>
                  <Button onClick={handleOpenDialog} startIcon={<AddRoundedIcon />} variant="contained">
                    Nueva invitación
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {!tenantLoading && !isAdmin ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Alert severity="warning">
                No tienes permisos para administrar invitaciones en esta junta.
              </Alert>
            </CardContent>
          </Card>
        ) : error ? (
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
        ) : showLoadingState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">Aún no hay invitaciones</Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1, mx: 'auto', maxWidth: 460 }}
                variant="body2"
              >
                Crea la primera invitación para comenzar a incorporar nuevos accesos a esta junta.
              </Typography>
              <Button onClick={handleOpenDialog} sx={{ mt: 3 }} variant="contained">
                Nueva invitación
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <TenantInvitationsTable rows={rows} />
          </Card>
        ) : (
          <TenantInvitationsMobileList rows={rows} />
        )}
      </Stack>

      {!isDesktop && isAdmin && (
        <Fab color="primary" onClick={handleOpenDialog} sx={{ position: 'fixed', right: 24, bottom: 24 }}>
          <AddRoundedIcon />
        </Fab>
      )}

      <TenantInvitationFormDialog
        errorMessage={createErrorMessage}
        loading={createLoading}
        onClose={handleCloseDialog}
        onSubmit={handleCreateInvitation}
        open={dialogOpen}
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
