import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTenant } from '../../tenant/context/TenantContext';
import {
  createTenantProfile,
  deleteTenantProfile,
  getTenantProfile,
  getTenantProfileErrorMessage,
  listTenantProfiles,
  updateTenantProfile,
} from '../services/tenantProfiles.service';
import type {
  TenantProfile,
  TenantProfileCreateDto,
  TenantProfileFormMode,
  TenantProfileListQuery,
  TenantProfileStatusFilter,
} from '../types/tenantProfiles.types';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

const PAGE_SIZE = 20;

const initialToastState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
};

function buildListQuery(
  page: number,
  limit: number,
  search: string,
  activo: TenantProfileStatusFilter,
): TenantProfileListQuery {
  return {
    page,
    limit,
    search,
    activo,
  };
}

export function useTenantProfiles() {
  const { tenantId, isAdmin, loading: tenantLoading } = useTenant();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<TenantProfile[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<TenantProfileStatusFilter>('TODOS');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<TenantProfileFormMode>('create');
  const [editingProfileId, setEditingProfileId] = useState<string | number | null>(null);
  const [formProfile, setFormProfile] = useState<TenantProfile | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [modulesProfile, setModulesProfile] = useState<TenantProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    setRows([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
    setError(null);
    setInitialLoading(true);
    setLoadingMore(false);
    nextPageLockRef.current = false;
  }, [debouncedSearch, estadoFilter, reloadKey, tenantId]);

  useEffect(() => {
    if (tenantLoading) {
      return;
    }

    if (!tenantId) {
      setRows([]);
      setHasMore(false);
      setTotal(0);
      setInitialLoading(false);
      setLoadingMore(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    if (!isAdmin) {
      setRows([]);
      setHasMore(false);
      setTotal(0);
      setInitialLoading(false);
      setLoadingMore(false);
      return;
    }

    const controller = new AbortController();
    const isFirstPage = page === 1;

    const loadProfiles = async () => {
      if (isFirstPage) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const response = await listTenantProfiles(
          tenantId,
          buildListQuery(page, PAGE_SIZE, debouncedSearch, estadoFilter),
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
          setError(
            getTenantProfileErrorMessage(loadError, 'No se pudieron cargar los perfiles.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setLoadingMore(false);
          nextPageLockRef.current = false;
        }
      }
    };

    void loadProfiles();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, estadoFilter, isAdmin, page, reloadKey, tenantId, tenantLoading]);

  useEffect(() => {
    if (!formOpen) {
      setFormProfile(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormProfile(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingProfileId) {
      setFormLoadError('No se pudo identificar el perfil a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadProfile = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const profile = await getTenantProfile(tenantId, editingProfileId, controller.signal);

        if (!controller.signal.aborted) {
          setFormProfile(profile);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(
            getTenantProfileErrorMessage(loadError, 'No se pudo cargar el perfil.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [editingProfileId, formMode, formOpen, tenantId]);

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
    setEstadoFilter('TODOS');
  };

  const handleReachEnd = () => {
    if (nextPageLockRef.current || initialLoading || loadingMore || !hasMore || Boolean(error)) {
      return;
    }

    nextPageLockRef.current = true;
    setPage((current) => current + 1);
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingProfileId(null);
    setFormProfile(null);
    setFormOpen(true);
  };

  const openEditDialog = (profile: TenantProfile) => {
    setFormMode('edit');
    setEditingProfileId(profile.idProfile);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingProfileId(null);
  };

  const submitForm = async (payload: TenantProfileCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingProfileId) {
      showMessage('No se pudo identificar el perfil a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateTenantProfile(tenantId, editingProfileId!, payload);
        showMessage('Perfil actualizado correctamente.', 'success');
      } else {
        await createTenantProfile(tenantId, payload);
        showMessage('Perfil creado correctamente.', 'success');
      }

      setFormOpen(false);
      setEditingProfileId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(getTenantProfileErrorMessage(submitError, 'No se pudo guardar el perfil.'), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openModulesDialog = (profile: TenantProfile) => {
    setModulesProfile(profile);
  };

  const closeModulesDialog = () => {
    setModulesProfile(null);
  };

  const handleModulesSaved = () => {
    setModulesProfile(null);
    setReloadKey((current) => current + 1);
    showMessage('Permisos actualizados correctamente.', 'success');
  };

  const openDeleteDialog = (profile: TenantProfile) => {
    setDeleteTarget(profile);
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
      await deleteTenantProfile(tenantId, deleteTarget.idProfile);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Perfil eliminado correctamente.', 'success');
    } catch (deleteError) {
      showMessage(getTenantProfileErrorMessage(deleteError, 'No se pudo eliminar el perfil.'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    tenantId,
    isAdmin,
    tenantLoading,
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
    clearFilters,
    retry,
    handleReachEnd,
    showEmptyState: !initialLoading && !error && rows.length === 0,
    formOpen,
    formMode,
    formProfile,
    formLoading,
    formSubmitting,
    formLoadError,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    modulesDialogOpen: Boolean(modulesProfile),
    modulesProfile,
    openModulesDialog,
    closeModulesDialog,
    handleModulesSaved,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetName: deleteTarget?.nombre,
    deleteLoading,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    toast,
    closeToast,
    showMessage,
  };
}
