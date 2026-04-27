import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConceptoCobroErrorMessage, getConceptoCobroLabel } from '../components/conceptosCobroUi';
import {
  createConceptoCobro,
  deleteConceptoCobro,
  getConceptoCobroById,
  getConceptosCobro,
  updateConceptoCobro,
} from '../services/conceptosCobro.service';
import type { ConceptoCobro, ConceptoCobroCreateDto, ConceptoCobroListQuery } from '../types';

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
  search: string,
  tipo: ConceptoCobroListQuery['tipo'],
  activo: ConceptoCobroListQuery['activo'],
  requierePeriodo: ConceptoCobroListQuery['requierePeriodo'],
): ConceptoCobroListQuery {
  return {
    search,
    tipo,
    activo,
    requierePeriodo,
  };
}

export function useConceptosCobro() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<ConceptoCobro[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<ConceptoCobroListQuery['tipo']>('TODOS');
  const [activoFilter, setActivoFilter] = useState<ConceptoCobroListQuery['activo']>('TODOS');
  const [requierePeriodoFilter, setRequierePeriodoFilter] =
    useState<ConceptoCobroListQuery['requierePeriodo']>('TODOS');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingConceptoId, setEditingConceptoId] = useState<string | number | null>(null);
  const [formConcepto, setFormConcepto] = useState<ConceptoCobro | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailConceptoId, setDetailConceptoId] = useState<string | number | null>(null);
  const [detailConcepto, setDetailConcepto] = useState<ConceptoCobro | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConceptoCobro | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

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

    setTipoFilter('TODOS');
    setActivoFilter('TODOS');
    setRequierePeriodoFilter('TODOS');
  }, [isDesktop]);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setTotal(0);
      setInitialLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadConceptos = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const response = await getConceptosCobro(
          tenantId,
          buildListQuery(
            debouncedSearch,
            isDesktop ? tipoFilter : 'TODOS',
            isDesktop ? activoFilter : 'TODOS',
            isDesktop ? requierePeriodoFilter : 'TODOS',
          ),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
          setTotal(response.length);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getConceptoCobroErrorMessage(loadError, 'No se pudo cargar la lista de conceptos de cobro.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      }
    };

    void loadConceptos();

    return () => {
      controller.abort();
    };
  }, [activoFilter, debouncedSearch, isDesktop, reloadKey, requierePeriodoFilter, tenantId, tipoFilter]);

  useEffect(() => {
    if (!formOpen) {
      setFormConcepto(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormConcepto(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingConceptoId) {
      setFormLoadError('No se pudo identificar el concepto a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadConcepto = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const concepto = await getConceptoCobroById(tenantId, editingConceptoId, controller.signal);

        if (!controller.signal.aborted) {
          setFormConcepto(concepto);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(getConceptoCobroErrorMessage(loadError, 'No se pudo cargar el concepto.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadConcepto();

    return () => {
      controller.abort();
    };
  }, [editingConceptoId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailConcepto(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailConceptoId) {
      setDetailError('No se pudo identificar el concepto solicitado.');
      return;
    }

    const controller = new AbortController();

    const loadConcepto = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const concepto = await getConceptoCobroById(tenantId, detailConceptoId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailConcepto(concepto);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(getConceptoCobroErrorMessage(loadError, 'No se pudo cargar el detalle del concepto.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadConcepto();

    return () => {
      controller.abort();
    };
  }, [detailConceptoId, detailOpen, tenantId]);

  const showEmptyState = !initialLoading && !error && rows.length === 0;
  const hasMore = false;

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
    setSearchInput('');
    setTipoFilter('TODOS');
    setActivoFilter('TODOS');
    setRequierePeriodoFilter('TODOS');
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingConceptoId(null);
    setFormConcepto(null);
    setFormOpen(true);
  };

  const openEditDialog = (concepto: ConceptoCobro) => {
    setFormMode('edit');
    setEditingConceptoId(concepto.idConceptoCobro);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingConceptoId(null);
  };

  const submitForm = async (payload: ConceptoCobroCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingConceptoId) {
      showMessage('No se pudo identificar el concepto a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateConceptoCobro(tenantId, editingConceptoId!, payload);
        showMessage('Concepto de cobro actualizado correctamente', 'success');
      } else {
        await createConceptoCobro(tenantId, payload);
        showMessage('Concepto de cobro creado correctamente', 'success');
      }

      setFormOpen(false);
      setEditingConceptoId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getConceptoCobroErrorMessage(submitError, 'No se pudo guardar el concepto.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (concepto: ConceptoCobro) => {
    setDetailConceptoId(concepto.idConceptoCobro);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailConceptoId(null);
  };

  const openDeleteDialog = (concepto: ConceptoCobro) => {
    setDeleteTarget(concepto);
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
      await deleteConceptoCobro(tenantId, deleteTarget.idConceptoCobro);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Concepto de cobro eliminado correctamente', 'success');
    } catch (deleteError) {
      showMessage(getConceptoCobroErrorMessage(deleteError, 'No se pudo eliminar el concepto.'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    tenantId,
    isDesktop,
    rows,
    initialLoading,
    loadingMore,
    error,
    hasMore,
    total,
    searchInput,
    setSearchInput,
    tipoFilter,
    setTipoFilter,
    activoFilter,
    setActivoFilter,
    requierePeriodoFilter,
    setRequierePeriodoFilter,
    clearFilters,
    retry,
    showEmptyState,
    formOpen,
    formMode,
    formConcepto,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    detailOpen,
    detailConcepto,
    detailLoading,
    detailError,
    openDetailDialog,
    closeDetailDialog,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetLabel: deleteTarget ? getConceptoCobroLabel(deleteTarget) : undefined,
    deleteLoading,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    toast,
    closeToast,
  };
}
