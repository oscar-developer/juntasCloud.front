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
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { AsambleaDetailDialog } from '../components/AsambleaDetailDialog';
import { AsambleaFormDialog } from '../components/AsambleaFormDialog';
import { AsambleasFiltersCard } from '../components/AsambleasFiltersCard';
import { AsambleasMobileFiltersDialog } from '../components/AsambleasMobileFiltersDialog';
import { AsambleasMobileList } from '../components/AsambleasMobileList';
import { AsambleasTable } from '../components/AsambleasTable';
import { ConfirmDeleteAsambleaDialog } from '../components/ConfirmDeleteAsambleaDialog';
import { getAsambleaErrorMessage, getAsambleaLabel } from '../components/asambleasUi';
import { deleteAsamblea, getAsambleas } from '../services/asambleasApi';
import type {
  Asamblea,
  AsambleaConvocatoria,
  AsambleaEstado,
  AsambleaListQuery,
  AsambleaTipo,
} from '../types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

type FormMode = 'create' | 'edit';

type AsambleasFiltersState = {
  from: string;
  to: string;
  tipo: AsambleaTipo | 'TODOS';
  convocatoria: AsambleaConvocatoria | 'TODOS';
  estado: AsambleaEstado | 'TODOS';
};

const initialToastState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
};

function getCurrentYearBounds() {
  const currentYear = new Date().getFullYear();

  return {
    from: `${currentYear}-01-01`,
    to: `${currentYear}-12-31`,
  };
}

function createDefaultFilters(): AsambleasFiltersState {
  const bounds = getCurrentYearBounds();

  return {
    from: bounds.from,
    to: bounds.to,
    tipo: 'TODOS',
    convocatoria: 'TODOS',
    estado: 'TODOS',
  };
}

function buildListQuery(filters: AsambleasFiltersState): AsambleaListQuery {
  return {
    from: filters.from,
    to: filters.to,
    tipo: filters.tipo,
    convocatoria: filters.convocatoria,
    estado: filters.estado,
  };
}

export function AsambleasPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<Asamblea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AsambleasFiltersState>(createDefaultFilters);
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDraftFilters, setMobileDraftFilters] = useState<AsambleasFiltersState>(createDefaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingAsambleaId, setEditingAsambleaId] = useState<string | number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAsambleaId, setDetailAsambleaId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asamblea | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);
  const attendanceBasePath = tenantId ? `/app/juntas/${tenantId}/asamblea-asistencia` : undefined;

  useEffect(() => {
    if (!mobileFiltersOpen) {
      setMobileDraftFilters(filters);
    }
  }, [filters, mobileFiltersOpen]);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadAsambleas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAsambleas(tenantId, buildListQuery(filters), controller.signal);

        if (!controller.signal.aborted) {
          setRows(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getAsambleaErrorMessage(loadError, 'No se pudo cargar la lista de asambleas.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadAsambleas();

    return () => {
      controller.abort();
    };
  }, [filters, reloadKey, tenantId]);

  const showEmptyState = !loading && !error && rows.length === 0;
  const total = rows.length;

  const appliedFiltersSummary = useMemo(
    () => ({
      tipo: filters.tipo,
      convocatoria: filters.convocatoria,
      estado: filters.estado,
    }),
    [filters.convocatoria, filters.estado, filters.tipo],
  );

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const updateFilters = (nextPartial: Partial<AsambleasFiltersState>) => {
    setFilters((current) => ({
      ...current,
      ...nextPartial,
    }));
  };

  const handleClearFilters = () => {
    setFilters(createDefaultFilters());
  };

  const handleOpenMobileFilters = () => {
    setMobileDraftFilters(filters);
    setMobileFiltersOpen(true);
  };

  const handleClearMobileDraftFilters = () => {
    setMobileDraftFilters(createDefaultFilters());
  };

  const handleApplyMobileFilters = () => {
    setFilters(mobileDraftFilters);
    setMobileFiltersOpen(false);
  };

  const handleOpenCreateDialog = () => {
    setFormMode('create');
    setEditingAsambleaId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (asamblea: Asamblea) => {
    setFormMode('edit');
    setEditingAsambleaId(asamblea.idAsamblea);
    setFormOpen(true);
  };

  const handleOpenDetail = (asamblea: Asamblea) => {
    setDetailAsambleaId(asamblea.idAsamblea);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingAsambleaId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!tenantId || !deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteAsamblea(tenantId, deleteTarget.idAsamblea);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      handleShowMessage('Asamblea eliminada correctamente', 'success');
    } catch (deleteError) {
      handleShowMessage(
        getAsambleaErrorMessage(deleteError, 'No se pudo eliminar la asamblea.'),
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva asamblea
            </Button>
          </Stack>
        )}

        <AsambleasFiltersCard
          convocatoriaValue={filters.convocatoria}
          estadoValue={filters.estado}
          fromValue={filters.from}
          isDesktop={isDesktop}
          onClear={handleClearFilters}
          onConvocatoriaChange={(value) => updateFilters({ convocatoria: value })}
          onEstadoChange={(value) => updateFilters({ estado: value })}
          onFromChange={(value) => updateFilters({ from: value })}
          onOpenMobileFilters={handleOpenMobileFilters}
          onTipoChange={(value) => updateFilters({ tipo: value })}
          onToChange={(value) => updateFilters({ to: value })}
          tipoValue={filters.tipo}
          toValue={filters.to}
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
              <Typography variant="h5">No hay asambleas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta el rango de fechas o crea una nueva asamblea para comenzar a organizar reuniones.
              </Typography>
              <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva asamblea
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <AsambleasTable
              attendanceBasePath={attendanceBasePath}
              onDelete={setDeleteTarget}
              onEdit={handleOpenEditDialog}
              onView={handleOpenDetail}
              rows={rows}
            />
          </Card>
        ) : (
          <AsambleasMobileList
            activeFilters={appliedFiltersSummary}
            attendanceBasePath={attendanceBasePath}
            onDelete={setDeleteTarget}
            onEdit={handleOpenEditDialog}
            onView={handleOpenDetail}
            rows={rows}
            total={total}
          />
        )}
      </Stack>

      {!isDesktop && (
        <Fab color="primary" onClick={handleOpenCreateDialog} sx={{ position: 'fixed', right: 24, bottom: 24 }}>
          <AddRoundedIcon />
        </Fab>
      )}

      {tenantId && (
        <>
          <AsambleaFormDialog
            asambleaId={editingAsambleaId}
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingAsambleaId(null);
            }}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            tenantId={tenantId}
          />
          <AsambleaDetailDialog
            asambleaId={detailAsambleaId}
            onClose={() => {
              setDetailOpen(false);
              setDetailAsambleaId(null);
            }}
            open={detailOpen}
            tenantId={tenantId}
          />
          <AsambleasMobileFiltersDialog
            filters={mobileDraftFilters}
            onApply={handleApplyMobileFilters}
            onChange={(nextPartial) =>
              setMobileDraftFilters((current) => ({
                ...current,
                ...nextPartial,
              }))
            }
            onClear={handleClearMobileDraftFilters}
            onClose={() => setMobileFiltersOpen(false)}
            open={mobileFiltersOpen}
          />
        </>
      )}

      <ConfirmDeleteAsambleaDialog
        asambleaLabel={deleteTarget ? getAsambleaLabel(deleteTarget) : undefined}
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
