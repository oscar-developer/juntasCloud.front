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
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { BienDetailDialog } from '../components/BienDetailDialog';
import { BienFiltersCard } from '../components/BienFiltersCard';
import { BienFormDialog } from '../components/BienFormDialog';
import { BienMobileList } from '../components/BienMobileList';
import { BienTable } from '../components/BienTable';
import { ConfirmDeactivateDialog } from '../components/ConfirmDeactivateDialog';
import { getBienErrorMessage, getBienLabel } from '../components/bienesUi';
import { deactivateBien, getBienes } from '../services/bienesApi';
import type { Bien, BienListQuery } from '../types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

type FormMode = 'create' | 'edit';
const PAGE_SIZE = 20;

const initialToastState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
};

function buildListQuery(
  page: number,
  pageSize: number,
  search: string,
  tipo: string,
  estado: BienListQuery['estado'],
): BienListQuery {
  return {
    page,
    pageSize,
    search,
    tipo,
    estado,
  };
}

export function BienesPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<Bien[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<BienListQuery['estado']>('TODOS');
  const [tipoFilter, setTipoFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingBienId, setEditingBienId] = useState<string | number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBienId, setDetailBienId] = useState<string | number | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Bien | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);
  const nextPageLockRef = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    setEstadoFilter('TODOS');
    setTipoFilter('');
  }, [isDesktop]);

  useEffect(() => {
    setRows([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
    setError(null);
    setInitialLoading(true);
    setLoadingMore(false);
    nextPageLockRef.current = false;
  }, [debouncedSearch, estadoFilter, isDesktop, reloadKey, tenantId, tipoFilter]);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setHasMore(false);
      setTotal(0);
      setInitialLoading(false);
      setLoadingMore(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();
    const isFirstPage = page === 1;

    const loadBienes = async () => {
      if (isFirstPage) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const response = await getBienes(
          tenantId,
          buildListQuery(
            page,
            PAGE_SIZE,
            debouncedSearch,
            isDesktop ? tipoFilter : '',
            isDesktop ? estadoFilter : 'TODOS',
          ),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setTotal(response.total);
          setRows((currentRows) => {
            const nextRows = isFirstPage ? response.items : [...currentRows, ...response.items];
            setHasMore(response.items.length > 0 && nextRows.length < response.total);
            return nextRows;
          });
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getBienErrorMessage(loadError, 'No se pudo cargar la lista de bienes.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setLoadingMore(false);
          nextPageLockRef.current = false;
        }
      }
    };

    void loadBienes();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, estadoFilter, isDesktop, page, reloadKey, tenantId, tipoFilter]);

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleReachEnd = () => {
    if (nextPageLockRef.current || initialLoading || loadingMore || !hasMore || Boolean(error)) {
      return;
    }

    nextPageLockRef.current = true;
    setPage((current) => current + 1);
  };

  const handleOpenCreateDialog = () => {
    setFormMode('create');
    setEditingBienId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (bien: Bien) => {
    setFormMode('edit');
    setEditingBienId(bien.idBien);
    setFormOpen(true);
  };

  const handleOpenDetail = (bien: Bien) => {
    setDetailBienId(bien.idBien);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingBienId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmDeactivate = async () => {
    if (!tenantId || !deactivateTarget) {
      return;
    }

    setDeactivateLoading(true);

    try {
      await deactivateBien(tenantId, deactivateTarget.idBien);
      setDeactivateTarget(null);
      setReloadKey((current) => current + 1);
      handleShowMessage('Bien dado de baja correctamente', 'success');
    } catch (deactivateError) {
      handleShowMessage(
        getBienErrorMessage(deactivateError, 'No se pudo dar de baja el bien.'),
        'error',
      );
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setTipoFilter('');
    setEstadoFilter('TODOS');
  };

  const showEmptyState = !initialLoading && !error && rows.length === 0;

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nuevo bien
            </Button>
          </Stack>
        )}

        <BienFiltersCard
          estadoValue={estadoFilter}
          isDesktop={isDesktop}
          onClear={handleClearFilters}
          onEstadoChange={setEstadoFilter}
          onSearchChange={setSearchInput}
          onTipoChange={setTipoFilter}
          searchValue={searchInput}
          tipoValue={tipoFilter}
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

        {initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay bienes registrados</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 440 }} variant="body2">
                Ajusta la búsqueda o crea un nuevo bien para comenzar a poblar el inventario.
              </Typography>
              <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nuevo bien
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <BienTable
              hasMore={hasMore}
              loadingMore={loadingMore}
              onDeactivate={setDeactivateTarget}
              onEdit={handleOpenEditDialog}
              onReachEnd={handleReachEnd}
              onView={handleOpenDetail}
              rows={rows}
            />
          </Card>
        ) : (
          <BienMobileList
            hasMore={hasMore}
            loadingMore={loadingMore}
            onDeactivate={setDeactivateTarget}
            onEdit={handleOpenEditDialog}
            onReachEnd={handleReachEnd}
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
          <BienFormDialog
            bienId={editingBienId}
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingBienId(null);
            }}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            tenantId={tenantId}
          />
          <BienDetailDialog
            bienId={detailBienId}
            onClose={() => {
              setDetailOpen(false);
              setDetailBienId(null);
            }}
            open={detailOpen}
            tenantId={tenantId}
          />
        </>
      )}

      <ConfirmDeactivateDialog
        bienLabel={deactivateTarget ? getBienLabel(deactivateTarget) : undefined}
        loading={deactivateLoading}
        onClose={() => {
          if (!deactivateLoading) {
            setDeactivateTarget(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmDeactivate();
        }}
        open={Boolean(deactivateTarget)}
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
