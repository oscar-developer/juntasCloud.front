import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { HttpError } from '../../../shared/api/httpClient';
import { Toast } from '../../../shared/ui/Toast';
import { ReceivedInvitationsMobileList } from '../components/ReceivedInvitationsMobileList';
import { ReceivedInvitationsTable } from '../components/ReceivedInvitationsTable';
import { acceptInvitation, getReceivedInvitations, rejectInvitation } from '../services/invitationsApi';
import type { InvitationStatus, ReceivedInvitation } from '../types';

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

function sortInvitations(rows: ReceivedInvitation[]) {
  return [...rows].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function getLoadErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return 'No se pudieron cargar las invitaciones recibidas. Inténtalo nuevamente.';
}

function getActionErrorMessage(error: unknown, action: 'accept' | 'reject') {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return action === 'accept'
    ? 'No se pudo aceptar la invitación. Inténtalo nuevamente.'
    : 'No se pudo rechazar la invitación. Inténtalo nuevamente.';
}

function applyActionResult(
  rows: ReceivedInvitation[],
  updatedInvitation: ReceivedInvitation,
  fallbackStatus: InvitationStatus,
) {
  return sortInvitations(
    rows.map((row) =>
      String(row.idInvitation) === String(updatedInvitation.idInvitation)
        ? {
            ...updatedInvitation,
            status: updatedInvitation.status === 'PENDING' ? fallbackStatus : updatedInvitation.status,
          }
        : row,
    ),
  );
}

export function InvitationsPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();
  const [rows, setRows] = useState<ReceivedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [actionLoadingType, setActionLoadingType] = useState<'accept' | 'reject' | null>(null);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    const controller = new AbortController();

    const loadInvitations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getReceivedInvitations(controller.signal);

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
  }, [reloadKey]);

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleInvitationAction = async (
    invitation: ReceivedInvitation,
    action: 'accept' | 'reject',
  ) => {
    setActionLoadingId(invitation.idInvitation);
    setActionLoadingType(action);

    try {
      const updatedInvitation =
        action === 'accept'
          ? await acceptInvitation(invitation.idInvitation)
          : await rejectInvitation(invitation.idInvitation);

      setRows((current) =>
        applyActionResult(current, updatedInvitation, action === 'accept' ? 'ACCEPTED' : 'REVOKED'),
      );
      handleShowMessage(
        action === 'accept' ? 'Invitación aceptada correctamente.' : 'Invitación rechazada correctamente.',
        'success',
      );
    } catch (actionError) {
      handleShowMessage(getActionErrorMessage(actionError, action), 'error');
    } finally {
      setActionLoadingId(null);
      setActionLoadingType(null);
    }
  };

  const showEmptyState = !loading && !error && rows.length === 0;

  return (
    <Box sx={{ pt: { xs: 2, md: 0 }, pb: { xs: 4, md: 0 } }}>
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
            <Box sx={{ width: '100%', minWidth: 0, maxWidth: { md: 820 } }}>
              <Typography sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}>
                Invitaciones recibidas
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }} variant="body1">
                Revisa y responde las invitaciones enviadas a {user?.email ?? 'tu cuenta'}.
              </Typography>
              {loading && <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />}
            </Box>
          </CardContent>
        </Card>

        {error ? (
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
        ) : loading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No tienes invitaciones recibidas</Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1, mx: 'auto', maxWidth: 460 }}
                variant="body2"
              >
                Cuando otra junta te invite, verás aquí el historial para aceptarlo o rechazarlo.
              </Typography>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <ReceivedInvitationsTable
              actionLoadingId={actionLoadingId}
              actionLoadingType={actionLoadingType}
              onAccept={(invitation) => {
                void handleInvitationAction(invitation, 'accept');
              }}
              onReject={(invitation) => {
                void handleInvitationAction(invitation, 'reject');
              }}
              rows={rows}
            />
          </Card>
        ) : (
          <ReceivedInvitationsMobileList
            actionLoadingId={actionLoadingId}
            actionLoadingType={actionLoadingType}
            onAccept={(invitation) => {
              void handleInvitationAction(invitation, 'accept');
            }}
            onReject={(invitation) => {
              void handleInvitationAction(invitation, 'reject');
            }}
            rows={rows}
          />
        )}
      </Stack>

      <Toast
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        open={toast.open}
        severity={toast.severity}
      />
    </Box>
  );
}
