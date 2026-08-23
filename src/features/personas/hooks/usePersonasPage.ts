import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant } from '../../tenant/context/TenantContext';
import { getFullName, getPersonaErrorMessage } from '../components/personaUi';
import {
  exportPersonasToExcel,
  exportPersonasToPdf,
  getPersonasForExport,
} from '../services/personasExport.service';
import { deletePersona, getPersonas } from '../services/personas.service';
import type { ListQuery, Persona } from '../types';

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
  dni: string,
  estado: ListQuery['estado'],
  tipoParticipante: ListQuery['tipoParticipante'],
): ListQuery {
  return {
    page,
    pageSize,
    search,
    dni,
    estado,
    tipoParticipante,
  };
}

export function usePersonasPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<Persona[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<ListQuery['estado']>('TODOS');
  const [tipoParticipanteFilter, setTipoParticipanteFilter] =
    useState<ListQuery['tipoParticipante']>('TODOS');
  const [dniFilter, setDniFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingPersonaId, setEditingPersonaId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
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
    setTipoParticipanteFilter('TODOS');
    setDniFilter('');
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
  }, [debouncedSearch, dniFilter, estadoFilter, isDesktop, reloadKey, tenantId, tipoParticipanteFilter]);

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

    const loadPersonas = async () => {
      if (isFirstPage) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const response = await getPersonas(
          tenantId,
          buildListQuery(
            page,
            PAGE_SIZE,
            debouncedSearch,
            isDesktop ? dniFilter : '',
            isDesktop ? estadoFilter : 'TODOS',
            isDesktop ? tipoParticipanteFilter : 'TODOS',
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
          setError(getPersonaErrorMessage(loadError, 'No se pudo cargar la lista de personas.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setLoadingMore(false);
          nextPageLockRef.current = false;
        }
      }
    };

    void loadPersonas();

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    dniFilter,
    estadoFilter,
    isDesktop,
    page,
    reloadKey,
    tenantId,
    tipoParticipanteFilter,
  ]);

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const retry = () => {
    setReloadKey((current) => current + 1);
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
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
    setEditingPersonaId(null);
    setFormOpen(true);
  };

  const openEditDialog = (persona: Persona) => {
    setFormMode('edit');
    setEditingPersonaId(persona.idPersona);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    setFormOpen(false);
    setEditingPersonaId(null);
  };

  const openFichaPage = (persona: Persona) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    navigate(`/app/juntas/${tenantId}/personas/${persona.idPersona}`);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingPersonaId(null);
    setReloadKey((current) => current + 1);
    showMessage(message, 'success');
  };

  const openDeleteDialog = (persona: Persona) => {
    setDeleteTarget(persona);
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
      await deletePersona(tenantId, deleteTarget.idPersona);
      setDeleteTarget(null);
      setReloadKey((current) => current + 1);
      showMessage('Persona eliminada correctamente', 'success');
    } catch (deleteError) {
      showMessage(getPersonaErrorMessage(deleteError, 'No se pudo eliminar la persona.'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setDniFilter('');
    setEstadoFilter('TODOS');
    setTipoParticipanteFilter('TODOS');
  };

  const openExportDialog = () => {
    setExportOpen(true);
  };

  const closeExportDialog = () => {
    setExportOpen(false);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    setExportLoading(true);

    try {
      const personas = await getPersonasForExport(tenantId, {
        search: debouncedSearch,
        dni: isDesktop ? dniFilter : '',
        estado: isDesktop ? estadoFilter : 'TODOS',
        tipoParticipante: isDesktop ? tipoParticipanteFilter : 'TODOS',
      });

      if (personas.length === 0) {
        showMessage('No hay personas para exportar con los filtros actuales.', 'info');
        return;
      }

      const reportMetadata = {
        tenantName: tenant?.nombre ?? 'Junta activa',
      };

      if (format === 'pdf') {
        exportPersonasToPdf(personas, reportMetadata);
        showMessage('Listado exportado en formato PDF.', 'success');
      } else {
        exportPersonasToExcel(personas, reportMetadata);
        showMessage('Listado exportado en formato Excel.', 'success');
      }

      setExportOpen(false);
    } catch (exportError) {
      showMessage(getPersonaErrorMessage(exportError, 'No se pudo exportar el listado de personas.'), 'error');
    } finally {
      setExportLoading(false);
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
    estadoFilter,
    tipoParticipanteFilter,
    dniFilter,
    formOpen,
    formMode,
    editingPersonaId,
    deleteLoading,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetName: deleteTarget ? getFullName(deleteTarget) : undefined,
    exportOpen,
    exportLoading,
    toast,
    showEmptyState: !initialLoading && !error && rows.length === 0,
    setSearchInput,
    setEstadoFilter,
    setTipoParticipanteFilter,
    setDniFilter,
    retry,
    closeToast,
    handleReachEnd,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    openFichaPage,
    handleSaved,
    showMessage,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    clearFilters,
    openExportDialog,
    closeExportDialog,
    handleExport,
  };
}
