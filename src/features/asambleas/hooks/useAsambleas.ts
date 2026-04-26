import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAsambleaErrorMessage, getAsambleaLabel } from '../components/asambleasUi';
import {
  createAsamblea,
  deleteAsamblea,
  getAsambleaById,
  getAsambleas,
  updateAsamblea,
} from '../services/asambleas.service';
import type {
  Asamblea,
  AsambleaConvocatoria,
  AsambleaCreateDto,
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

export function useAsambleas() {
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
  const [formAsamblea, setFormAsamblea] = useState<Asamblea | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAsambleaId, setDetailAsambleaId] = useState<string | number | null>(null);
  const [detailAsamblea, setDetailAsamblea] = useState<Asamblea | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asamblea | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

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

  useEffect(() => {
    if (!formOpen) {
      setFormAsamblea(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormAsamblea(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingAsambleaId) {
      setFormLoadError('No se pudo identificar la asamblea a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadAsamblea = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const asamblea = await getAsambleaById(tenantId, editingAsambleaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormAsamblea(asamblea);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(getAsambleaErrorMessage(loadError, 'No se pudo cargar la asamblea.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadAsamblea();

    return () => {
      controller.abort();
    };
  }, [editingAsambleaId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailAsamblea(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailAsambleaId) {
      setDetailError('No se pudo identificar la asamblea solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadAsamblea = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const asamblea = await getAsambleaById(tenantId, detailAsambleaId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailAsamblea(asamblea);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(getAsambleaErrorMessage(loadError, 'No se pudo cargar el detalle de la asamblea.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadAsamblea();

    return () => {
      controller.abort();
    };
  }, [detailAsambleaId, detailOpen, tenantId]);

  const appliedFiltersSummary = useMemo(
    () => ({
      tipo: filters.tipo,
      convocatoria: filters.convocatoria,
      estado: filters.estado,
    }),
    [filters.convocatoria, filters.estado, filters.tipo],
  );

  const showEmptyState = !loading && !error && rows.length === 0;
  const total = rows.length;
  const attendanceBasePath = tenantId ? `/app/juntas/${tenantId}/asamblea-asistencia` : undefined;

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const retry = () => {
    setReloadKey((current) => current + 1);
  };

  const updateFilters = (nextPartial: Partial<AsambleasFiltersState>) => {
    setFilters((current) => ({
      ...current,
      ...nextPartial,
    }));
  };

  const clearFilters = () => {
    setFilters(createDefaultFilters());
  };

  const openMobileFilters = () => {
    setMobileDraftFilters(filters);
    setMobileFiltersOpen(true);
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
  };

  const clearMobileDraftFilters = () => {
    setMobileDraftFilters(createDefaultFilters());
  };

  const applyMobileFilters = () => {
    setFilters(mobileDraftFilters);
    setMobileFiltersOpen(false);
  };

  const updateMobileDraftFilters = (nextPartial: Partial<AsambleasFiltersState>) => {
    setMobileDraftFilters((current) => ({
      ...current,
      ...nextPartial,
    }));
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingAsambleaId(null);
    setFormAsamblea(null);
    setFormOpen(true);
  };

  const openEditDialog = (asamblea: Asamblea) => {
    setFormMode('edit');
    setEditingAsambleaId(asamblea.idAsamblea);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingAsambleaId(null);
  };

  const submitForm = async (payload: AsambleaCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingAsambleaId) {
      showMessage('No se pudo identificar la asamblea a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateAsamblea(tenantId, editingAsambleaId!, payload);
        showMessage('Asamblea actualizada correctamente', 'success');
      } else {
        await createAsamblea(tenantId, payload);
        showMessage('Asamblea creada correctamente', 'success');
      }

      setFormOpen(false);
      setEditingAsambleaId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getAsambleaErrorMessage(submitError, 'No se pudo guardar la asamblea.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (asamblea: Asamblea) => {
    setDetailAsambleaId(asamblea.idAsamblea);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailAsambleaId(null);
  };

  const openDeleteDialog = (asamblea: Asamblea) => {
    setDeleteTarget(asamblea);
  };

  const closeDeleteDialog = () => {
    if (!deleteLoading) {
      setDeleteTarget(null);
    }
  };

  const confirmDelete = async () => {
    if (!tenantId || !deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteAsamblea(tenantId, deleteTarget.idAsamblea);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Asamblea eliminada correctamente', 'success');
    } catch (deleteError) {
      showMessage(getAsambleaErrorMessage(deleteError, 'No se pudo eliminar la asamblea.'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    tenantId,
    isDesktop,
    rows,
    loading,
    error,
    filters,
    appliedFiltersSummary,
    showEmptyState,
    total,
    attendanceBasePath,
    updateFilters,
    clearFilters,
    retry,
    mobileFiltersOpen,
    mobileDraftFilters,
    openMobileFilters,
    closeMobileFilters,
    clearMobileDraftFilters,
    applyMobileFilters,
    updateMobileDraftFilters,
    formOpen,
    formMode,
    formAsamblea,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    detailOpen,
    detailAsamblea,
    detailLoading,
    detailError,
    openDetailDialog,
    closeDetailDialog,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetLabel: deleteTarget ? getAsambleaLabel(deleteTarget) : undefined,
    deleteLoading,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    toast,
    closeToast,
  };
}
