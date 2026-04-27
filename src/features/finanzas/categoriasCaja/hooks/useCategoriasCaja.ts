import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoriaCajaErrorMessage, getCategoriaCajaLabel } from '../components/categoriasCajaUi';
import {
  createCategoriaCaja,
  deleteCategoriaCaja,
  getCategoriaCajaById,
  getCategoriasCaja,
  updateCategoriaCaja,
} from '../services/categoriasCaja.service';
import type { CajaCategoria, CajaCategoriaCreateDto, CajaCategoriaListQuery } from '../types';

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
  tipo: CajaCategoriaListQuery['tipo'],
  activo: CajaCategoriaListQuery['activo'],
): CajaCategoriaListQuery {
  return {
    search,
    tipo,
    activo,
  };
}

export function useCategoriasCaja() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<CajaCategoria[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<CajaCategoriaListQuery['tipo']>('TODOS');
  const [activoFilter, setActivoFilter] = useState<CajaCategoriaListQuery['activo']>('TODOS');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingCategoriaId, setEditingCategoriaId] = useState<string | number | null>(null);
  const [formCategoria, setFormCategoria] = useState<CajaCategoria | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategoriaId, setDetailCategoriaId] = useState<string | number | null>(null);
  const [detailCategoria, setDetailCategoria] = useState<CajaCategoria | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CajaCategoria | null>(null);
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

    const loadCategorias = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        const response = await getCategoriasCaja(
          tenantId,
          buildListQuery(
            debouncedSearch,
            isDesktop ? tipoFilter : 'TODOS',
            isDesktop ? activoFilter : 'TODOS',
          ),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
          setTotal(response.length);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getCategoriaCajaErrorMessage(loadError, 'No se pudo cargar la lista de categorías de caja.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      }
    };

    void loadCategorias();

    return () => {
      controller.abort();
    };
  }, [activoFilter, debouncedSearch, isDesktop, reloadKey, tenantId, tipoFilter]);

  useEffect(() => {
    if (!formOpen) {
      setFormCategoria(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormCategoria(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingCategoriaId) {
      setFormLoadError('No se pudo identificar la categoría a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadCategoria = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const categoria = await getCategoriaCajaById(tenantId, editingCategoriaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormCategoria(categoria);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(getCategoriaCajaErrorMessage(loadError, 'No se pudo cargar la categoría.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadCategoria();

    return () => {
      controller.abort();
    };
  }, [editingCategoriaId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailCategoria(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailCategoriaId) {
      setDetailError('No se pudo identificar la categoría solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadCategoria = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const categoria = await getCategoriaCajaById(tenantId, detailCategoriaId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailCategoria(categoria);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(getCategoriaCajaErrorMessage(loadError, 'No se pudo cargar el detalle de la categoría.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadCategoria();

    return () => {
      controller.abort();
    };
  }, [detailCategoriaId, detailOpen, tenantId]);

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
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingCategoriaId(null);
    setFormCategoria(null);
    setFormOpen(true);
  };

  const openEditDialog = (categoria: CajaCategoria) => {
    setFormMode('edit');
    setEditingCategoriaId(categoria.idCategoriaCaja);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingCategoriaId(null);
  };

  const submitForm = async (payload: CajaCategoriaCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingCategoriaId) {
      showMessage('No se pudo identificar la categoría a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateCategoriaCaja(tenantId, editingCategoriaId!, payload);
        showMessage('Categoría de caja actualizada correctamente', 'success');
      } else {
        await createCategoriaCaja(tenantId, payload);
        showMessage('Categoría de caja creada correctamente', 'success');
      }

      setFormOpen(false);
      setEditingCategoriaId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getCategoriaCajaErrorMessage(submitError, 'No se pudo guardar la categoría.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (categoria: CajaCategoria) => {
    setDetailCategoriaId(categoria.idCategoriaCaja);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailCategoriaId(null);
  };

  const openDeleteDialog = (categoria: CajaCategoria) => {
    setDeleteTarget(categoria);
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
      await deleteCategoriaCaja(tenantId, deleteTarget.idCategoriaCaja);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Categoría de caja eliminada correctamente', 'success');
    } catch (deleteError) {
      showMessage(getCategoriaCajaErrorMessage(deleteError, 'No se pudo eliminar la categoría.'), 'error');
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
    clearFilters,
    retry,
    showEmptyState,
    formOpen,
    formMode,
    formCategoria,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    detailOpen,
    detailCategoria,
    detailLoading,
    detailError,
    openDetailDialog,
    closeDetailDialog,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetLabel: deleteTarget ? getCategoriaCajaLabel(deleteTarget) : undefined,
    deleteLoading,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    toast,
    closeToast,
  };
}
