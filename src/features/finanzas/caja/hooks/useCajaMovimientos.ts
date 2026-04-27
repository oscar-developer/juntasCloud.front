import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getCajaMovimientoErrorMessage,
  getCajaMovimientoLabel,
} from '../components/cajaMovimientosUi';
import {
  anularMovimiento,
  createMovimiento,
  getMovimientoById,
  getMovimientos,
  updateMovimiento,
} from '../services/cajaMovimientos.service';
import type {
  CajaMovimiento,
  CajaMovimientoListItem,
  CajaMovimientosQuery,
  CreateMovimientoDto,
} from '../types';

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

function buildListQuery(
  from: string,
  to: string,
  tipo: CajaMovimientosQuery['tipo'],
  page: number,
  rowsPerPage: number,
): CajaMovimientosQuery {
  return {
    from: from || undefined,
    to: to || undefined,
    tipo,
    page: page + 1,
    limit: rowsPerPage,
  };
}

export function useCajaMovimientos() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<CajaMovimientoListItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState<CajaMovimientosQuery['tipo']>('TODOS');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingMovimientoId, setEditingMovimientoId] = useState<string | number | null>(null);
  const [formMovimiento, setFormMovimiento] = useState<CajaMovimiento | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [anularTarget, setAnularTarget] = useState<CajaMovimientoListItem | null>(null);
  const [anularLoading, setAnularLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    setPage(0);
  }, [fromFilter, rowsPerPage, tipoFilter, toFilter]);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setTotal(0);
      setInitialLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadMovimientos = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const response = await getMovimientos(
          tenantId,
          buildListQuery(fromFilter, toFilter, tipoFilter, page, rowsPerPage),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response.items);
          setTotal(response.total);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            getCajaMovimientoErrorMessage(
              loadError,
              'No se pudo cargar la lista de movimientos de caja.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      }
    };

    void loadMovimientos();

    return () => {
      controller.abort();
    };
  }, [fromFilter, page, reloadKey, rowsPerPage, tenantId, tipoFilter, toFilter]);

  useEffect(() => {
    if (!formOpen) {
      setFormMovimiento(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormMovimiento(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingMovimientoId) {
      setFormLoadError('No se pudo identificar el movimiento a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadMovimiento = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const movimiento = await getMovimientoById(tenantId, editingMovimientoId, controller.signal);

        if (!controller.signal.aborted) {
          setFormMovimiento(movimiento);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(
            getCajaMovimientoErrorMessage(loadError, 'No se pudo cargar el movimiento de caja.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadMovimiento();

    return () => {
      controller.abort();
    };
  }, [editingMovimientoId, formMode, formOpen, tenantId]);

  const showEmptyState = !initialLoading && !error && rows.length === 0;

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const retry = () => {
    setReloadKey((current) => current + 1);
  };

  const clearFilters = () => {
    setFromFilter('');
    setToFilter('');
    setTipoFilter('TODOS');
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
    setPage(0);
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingMovimientoId(null);
    setFormMovimiento(null);
    setFormOpen(true);
  };

  const openEditDialog = (movimiento: CajaMovimientoListItem) => {
    setFormMode('edit');
    setEditingMovimientoId(movimiento.idMovimiento);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingMovimientoId(null);
  };

  const submitForm = async (payload: CreateMovimientoDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingMovimientoId) {
      showMessage('No se pudo identificar el movimiento a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateMovimiento(tenantId, editingMovimientoId!, payload);
        showMessage('Movimiento de caja actualizado correctamente', 'success');
      } else {
        await createMovimiento(tenantId, payload);
        showMessage('Movimiento de caja creado correctamente', 'success');
      }

      setFormOpen(false);
      setEditingMovimientoId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(
        getCajaMovimientoErrorMessage(submitError, 'No se pudo guardar el movimiento de caja.'),
        'error',
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const openAnularDialog = (movimiento: CajaMovimientoListItem) => {
    setAnularTarget(movimiento);
  };

  const closeAnularDialog = () => {
    if (!anularLoading) {
      setAnularTarget(null);
    }
  };

  const confirmAnular = async (motivoAnulacion: string) => {
    if (!tenantId || !anularTarget) {
      return;
    }

    setAnularLoading(true);

    try {
      await anularMovimiento(tenantId, anularTarget.idMovimiento, { motivoAnulacion });
      setAnularTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Movimiento de caja anulado correctamente', 'success');
    } catch (anularError) {
      showMessage(
        getCajaMovimientoErrorMessage(anularError, 'No se pudo anular el movimiento de caja.'),
        'error',
      );
    } finally {
      setAnularLoading(false);
    }
  };

  return {
    tenantId,
    isDesktop,
    rows,
    initialLoading,
    error,
    total,
    page,
    rowsPerPage,
    fromFilter,
    setFromFilter,
    toFilter,
    setToFilter,
    tipoFilter,
    setTipoFilter,
    clearFilters,
    retry,
    showEmptyState,
    handlePageChange,
    handleRowsPerPageChange,
    formOpen,
    formMode,
    formMovimiento,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    anularDialogOpen: Boolean(anularTarget),
    anularTargetLabel: anularTarget ? getCajaMovimientoLabel(anularTarget) : undefined,
    anularLoading,
    openAnularDialog,
    closeAnularDialog,
    confirmAnular,
    toast,
    closeToast,
    showMessage,
  };
}
