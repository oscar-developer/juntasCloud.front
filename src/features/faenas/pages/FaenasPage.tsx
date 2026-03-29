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
import { ConfirmDeleteFaenaDialog } from '../components/ConfirmDeleteFaenaDialog';
import { FaenaDetailDialog } from '../components/FaenaDetailDialog';
import { FaenaFiltersCard } from '../components/FaenaFiltersCard';
import { FaenaFormDialog } from '../components/FaenaFormDialog';
import { FaenaMobileFiltersDialog } from '../components/FaenaMobileFiltersDialog';
import { FaenaMobileList } from '../components/FaenaMobileList';
import { FaenaTable } from '../components/FaenaTable';
import { getFaenaErrorMessage, getFaenaLabel } from '../components/faenasUi';
import { deleteFaena, getFaenas } from '../services/faenasApi';
import type { Faena, FaenaEstado, FaenaListQuery, FaenaTipo } from '../types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

type FormMode = 'create' | 'edit';

type FaenaFiltersState = {
  from: string;
  to: string;
  search: string;
  tipoFaena: FaenaTipo | 'TODOS';
  estado: FaenaEstado | 'TODOS';
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

function createDefaultFilters(): FaenaFiltersState {
  const bounds = getCurrentYearBounds();

  return {
    from: bounds.from,
    to: bounds.to,
    search: '',
    tipoFaena: 'TODOS',
    estado: 'TODOS',
  };
}

function buildListQuery(filters: FaenaFiltersState, search: string): FaenaListQuery {
  return {
    from: filters.from,
    to: filters.to,
    search,
    tipoFaena: filters.tipoFaena,
    estado: filters.estado,
  };
}

export function FaenasPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<Faena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FaenaFiltersState>(createDefaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDraftFilters, setMobileDraftFilters] = useState<FaenaFiltersState>(createDefaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingFaenaId, setEditingFaenaId] = useState<string | number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFaenaId, setDetailFaenaId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faena | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);
  const attendanceBasePath = tenantId ? `/app/juntas/${tenantId}/faena-asistencia` : undefined;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters.search]);

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

    const loadFaenas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getFaenas(
          tenantId,
          buildListQuery(filters, debouncedSearch),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getFaenaErrorMessage(loadError, 'No se pudo cargar la lista de faenas.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadFaenas();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, filters, reloadKey, tenantId]);

  const showEmptyState = !loading && !error && rows.length === 0;
  const total = rows.length;

  const appliedFiltersSummary = useMemo(
    () => ({
      tipoFaena: filters.tipoFaena,
      estado: filters.estado,
      search: filters.search,
    }),
    [filters.estado, filters.search, filters.tipoFaena],
  );

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const updateFilters = (nextPartial: Partial<FaenaFiltersState>) => {
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
    setEditingFaenaId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (faena: Faena) => {
    setFormMode('edit');
    setEditingFaenaId(faena.idFaena);
    setFormOpen(true);
  };

  const handleOpenDetail = (faena: Faena) => {
    setDetailFaenaId(faena.idFaena);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingFaenaId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!tenantId || !deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteFaena(tenantId, deleteTarget.idFaena);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      handleShowMessage('Faena eliminada correctamente', 'success');
    } catch (deleteError) {
      handleShowMessage(
        getFaenaErrorMessage(deleteError, 'No se pudo eliminar la faena.'),
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
              Nueva faena
            </Button>
          </Stack>
        )}

        <FaenaFiltersCard
          estadoValue={filters.estado}
          fromValue={filters.from}
          isDesktop={isDesktop}
          onClear={handleClearFilters}
          onEstadoChange={(value) => updateFilters({ estado: value })}
          onFromChange={(value) => updateFilters({ from: value })}
          onOpenMobileFilters={handleOpenMobileFilters}
          onSearchChange={(value) => updateFilters({ search: value })}
          onTipoFaenaChange={(value) => updateFilters({ tipoFaena: value })}
          onToChange={(value) => updateFilters({ to: value })}
          searchValue={filters.search}
          tipoFaenaValue={filters.tipoFaena}
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
              <Typography variant="h5">No hay faenas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta el rango de fechas o crea una nueva faena para comenzar a planificar actividades.
              </Typography>
              <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva faena
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <FaenaTable
              attendanceBasePath={attendanceBasePath}
              onDelete={setDeleteTarget}
              onEdit={handleOpenEditDialog}
              onView={handleOpenDetail}
              rows={rows}
            />
          </Card>
        ) : (
          <FaenaMobileList
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
          <FaenaFormDialog
            faenaId={editingFaenaId}
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingFaenaId(null);
            }}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            tenantId={tenantId}
          />
          <FaenaDetailDialog
            faenaId={detailFaenaId}
            onClose={() => {
              setDetailOpen(false);
              setDetailFaenaId(null);
            }}
            open={detailOpen}
            tenantId={tenantId}
          />
          <FaenaMobileFiltersDialog
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

      <ConfirmDeleteFaenaDialog
        faenaLabel={deleteTarget ? getFaenaLabel(deleteTarget) : undefined}
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