import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBienErrorMessage, getBienLabel } from '../components/bienesUi';
import {
  createBien,
  deactivateBien,
  getBienById,
  getBienes,
  updateBien,
} from '../services/bienes.service';
import type { Bien, BienCreateDto, BienListQuery } from '../types';

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

export function useBienes() {
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
  const [formBien, setFormBien] = useState<Bien | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBienId, setDetailBienId] = useState<string | number | null>(null);
  const [detailBien, setDetailBien] = useState<Bien | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!formOpen) {
      setFormBien(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormBien(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingBienId) {
      setFormLoadError('No se pudo identificar el bien a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadBien = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const bien = await getBienById(tenantId, editingBienId, controller.signal);

        if (!controller.signal.aborted) {
          setFormBien(bien);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(getBienErrorMessage(loadError, 'No se pudo cargar el bien.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadBien();

    return () => {
      controller.abort();
    };
  }, [editingBienId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailBien(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailBienId) {
      setDetailError('No se pudo identificar el bien solicitado.');
      return;
    }

    const controller = new AbortController();

    const loadBien = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const bien = await getBienById(tenantId, detailBienId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailBien(bien);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(getBienErrorMessage(loadError, 'No se pudo cargar el detalle del bien.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadBien();

    return () => {
      controller.abort();
    };
  }, [detailBienId, detailOpen, tenantId]);

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

  const handleReachEnd = () => {
    if (nextPageLockRef.current || initialLoading || loadingMore || !hasMore || Boolean(error)) {
      return;
    }

    nextPageLockRef.current = true;
    setPage((current) => current + 1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setTipoFilter('');
    setEstadoFilter('TODOS');
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingBienId(null);
    setFormBien(null);
    setFormOpen(true);
  };

  const openEditDialog = (bien: Bien) => {
    setFormMode('edit');
    setEditingBienId(bien.idBien);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingBienId(null);
  };

  const submitForm = async (payload: BienCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingBienId) {
      showMessage('No se pudo identificar el bien a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateBien(tenantId, editingBienId!, payload);
        showMessage('Bien actualizado correctamente', 'success');
      } else {
        await createBien(tenantId, payload);
        showMessage('Bien creado correctamente', 'success');
      }

      setFormOpen(false);
      setEditingBienId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getBienErrorMessage(submitError, 'No se pudo guardar el bien.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (bien: Bien) => {
    setDetailBienId(bien.idBien);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailBienId(null);
  };

  const openDeactivateDialog = (bien: Bien) => {
    setDeactivateTarget(bien);
  };

  const closeDeactivateDialog = () => {
    if (!deactivateLoading) {
      setDeactivateTarget(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!tenantId || !deactivateTarget) {
      return;
    }

    setDeactivateLoading(true);

    try {
      await deactivateBien(tenantId, deactivateTarget.idBien);
      setDeactivateTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Bien dado de baja correctamente', 'success');
    } catch (deactivateError) {
      showMessage(getBienErrorMessage(deactivateError, 'No se pudo dar de baja el bien.'), 'error');
    } finally {
      setDeactivateLoading(false);
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
    estadoFilter,
    setEstadoFilter,
    tipoFilter,
    setTipoFilter,
    clearFilters,
    retry,
    handleReachEnd,
    showEmptyState,
    formOpen,
    formMode,
    formBien,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    detailOpen,
    detailBien,
    detailLoading,
    detailError,
    openDetailDialog,
    closeDetailDialog,
    deactivateDialogOpen: Boolean(deactivateTarget),
    deactivateTargetLabel: deactivateTarget ? getBienLabel(deactivateTarget) : undefined,
    deactivateLoading,
    openDeactivateDialog,
    closeDeactivateDialog,
    confirmDeactivate,
    toast,
    closeToast,
  };
}
