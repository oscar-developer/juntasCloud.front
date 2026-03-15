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
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmDeleteJuntaDirectivaDialog } from '../components/ConfirmDeleteJuntaDirectivaDialog';
import { JuntaDirectivaDetailDialog } from '../components/JuntaDirectivaDetailDialog';
import { JuntaDirectivaFormDialog } from '../components/JuntaDirectivaFormDialog';
import { JuntasDirectivasFiltersCard } from '../components/JuntasDirectivasFiltersCard';
import { JuntasDirectivasMobileList } from '../components/JuntasDirectivasMobileList';
import { JuntasDirectivasTable } from '../components/JuntasDirectivasTable';
import {
  getJuntaDirectivaLabel,
  getJuntasDirectivasErrorMessage,
} from '../components/juntasDirectivasUi';
import {
  deleteJuntaDirectiva,
  getJuntasDirectivas,
} from '../services/juntasDirectivasApi';
import type { JuntaDirectiva, JuntasDirectivasListQuery } from '../types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

type FormMode = 'create' | 'edit';

const initialToastState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
};

export function JuntasDirectivasPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<JuntaDirectiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<JuntasDirectivasListQuery['estado']>('TODOS');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingJuntaId, setEditingJuntaId] = useState<string | number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJuntaId, setDetailJuntaId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JuntaDirectiva | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadJuntasDirectivas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getJuntasDirectivas(
          tenantId,
          {
            estado: estadoFilter,
            from: fromFilter,
            to: toFilter,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            getJuntasDirectivasErrorMessage(
              loadError,
              'No se pudo cargar la lista de juntas directivas.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJuntasDirectivas();

    return () => {
      controller.abort();
    };
  }, [tenantId, estadoFilter, fromFilter, toFilter, reloadKey]);

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleOpenCreateDialog = () => {
    setFormMode('create');
    setEditingJuntaId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (junta: JuntaDirectiva) => {
    setFormMode('edit');
    setEditingJuntaId(junta.idJunta);
    setFormOpen(true);
  };

  const handleOpenDetail = (junta: JuntaDirectiva) => {
    setDetailJuntaId(junta.idJunta);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingJuntaId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!tenantId || !deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteJuntaDirectiva(tenantId, deleteTarget.idJunta);
      setRows((current) =>
        current.filter((junta) => String(junta.idJunta) !== String(deleteTarget.idJunta)),
      );
      setDeleteTarget(null);
      handleShowMessage('Junta directiva eliminada correctamente', 'success');
    } catch (deleteError) {
      handleShowMessage(
        getJuntasDirectivasErrorMessage(
          deleteError,
          'No se pudo eliminar la junta directiva.',
        ),
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearFilters = () => {
    setEstadoFilter('TODOS');
    setFromFilter('');
    setToFilter('');
  };

  const showEmptyState = !loading && !error && rows.length === 0;

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva junta directiva
            </Button>
          </Stack>
        )}

        <JuntasDirectivasFiltersCard
          estadoValue={estadoFilter}
          fromValue={fromFilter}
          onClear={handleClearFilters}
          onEstadoChange={setEstadoFilter}
          onFromChange={setFromFilter}
          onToChange={setToFilter}
          toValue={toFilter}
        />

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

        {loading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay juntas directivas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta los filtros o crea una nueva junta directiva para comenzar a registrar periodos.
              </Typography>
              <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva junta directiva
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <JuntasDirectivasTable
              onDelete={setDeleteTarget}
              onEdit={handleOpenEditDialog}
              onView={handleOpenDetail}
              rows={rows}
            />
          </Card>
        ) : (
          <JuntasDirectivasMobileList
            onDelete={setDeleteTarget}
            onEdit={handleOpenEditDialog}
            onView={handleOpenDetail}
            rows={rows}
          />
        )}
      </Stack>

      {!isDesktop && (
        <Fab
          color="primary"
          onClick={handleOpenCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {tenantId && (
        <>
          <JuntaDirectivaFormDialog
            juntaId={editingJuntaId}
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingJuntaId(null);
            }}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            tenantId={tenantId}
          />
          <JuntaDirectivaDetailDialog
            juntaId={detailJuntaId}
            onClose={() => {
              setDetailOpen(false);
              setDetailJuntaId(null);
            }}
            open={detailOpen}
            tenantId={tenantId}
          />
        </>
      )}

      <ConfirmDeleteJuntaDirectivaDialog
        juntaName={deleteTarget ? getJuntaDirectivaLabel(deleteTarget) : undefined}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        open={Boolean(deleteTarget)}
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
