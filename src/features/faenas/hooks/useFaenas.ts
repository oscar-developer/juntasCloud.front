import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFaenaErrorMessage, getFaenaLabel } from '../components/faenasUi';
import {
  createFaena,
  deleteFaena,
  getFaenaById,
  getFaenas,
  updateFaena,
} from '../services/faenas.service';
import type { Faena, FaenaCreateDto, FaenaEstado, FaenaListQuery, FaenaTipo } from '../types';

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

export function useFaenas() {
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
  const [formFaena, setFormFaena] = useState<Faena | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFaenaId, setDetailFaenaId] = useState<string | number | null>(null);
  const [detailFaena, setDetailFaena] = useState<Faena | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faena | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

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

  useEffect(() => {
    if (!formOpen) {
      setFormFaena(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormFaena(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingFaenaId) {
      setFormLoadError('No se pudo identificar la faena a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadFaena = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const faena = await getFaenaById(tenantId, editingFaenaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormFaena(faena);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(getFaenaErrorMessage(loadError, 'No se pudo cargar la faena.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadFaena();

    return () => {
      controller.abort();
    };
  }, [editingFaenaId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailFaena(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailFaenaId) {
      setDetailError('No se pudo identificar la faena solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadFaena = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const faena = await getFaenaById(tenantId, detailFaenaId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailFaena(faena);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(getFaenaErrorMessage(loadError, 'No se pudo cargar el detalle de la faena.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadFaena();

    return () => {
      controller.abort();
    };
  }, [detailFaenaId, detailOpen, tenantId]);

  const appliedFiltersSummary = useMemo(
    () => ({
      tipoFaena: filters.tipoFaena,
      estado: filters.estado,
      search: filters.search,
    }),
    [filters.estado, filters.search, filters.tipoFaena],
  );

  const showEmptyState = !loading && !error && rows.length === 0;
  const total = rows.length;
  const attendanceBasePath = tenantId ? `/app/juntas/${tenantId}/faena-asistencia` : undefined;

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const retry = () => {
    setReloadKey((current) => current + 1);
  };

  const updateFilters = (nextPartial: Partial<FaenaFiltersState>) => {
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

  const updateMobileDraftFilters = (nextPartial: Partial<FaenaFiltersState>) => {
    setMobileDraftFilters((current) => ({
      ...current,
      ...nextPartial,
    }));
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingFaenaId(null);
    setFormFaena(null);
    setFormOpen(true);
  };

  const openEditDialog = (faena: Faena) => {
    setFormMode('edit');
    setEditingFaenaId(faena.idFaena);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingFaenaId(null);
  };

  const submitForm = async (payload: FaenaCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingFaenaId) {
      showMessage('No se pudo identificar la faena a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateFaena(tenantId, editingFaenaId!, payload);
        showMessage('Faena actualizada correctamente', 'success');
      } else {
        await createFaena(tenantId, payload);
        showMessage('Faena creada correctamente', 'success');
      }

      setFormOpen(false);
      setEditingFaenaId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getFaenaErrorMessage(submitError, 'No se pudo guardar la faena.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (faena: Faena) => {
    setDetailFaenaId(faena.idFaena);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailFaenaId(null);
  };

  const openDeleteDialog = (faena: Faena) => {
    setDeleteTarget(faena);
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
      await deleteFaena(tenantId, deleteTarget.idFaena);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Faena eliminada correctamente', 'success');
    } catch (deleteError) {
      showMessage(getFaenaErrorMessage(deleteError, 'No se pudo eliminar la faena.'), 'error');
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
    formFaena,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    detailOpen,
    detailFaena,
    detailLoading,
    detailError,
    openDetailDialog,
    closeDetailDialog,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetLabel: deleteTarget ? getFaenaLabel(deleteTarget) : undefined,
    deleteLoading,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    toast,
    closeToast,
  };
}
