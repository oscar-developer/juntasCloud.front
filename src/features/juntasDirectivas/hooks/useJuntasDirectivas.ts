import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJuntaDirectivaLabel, getJuntasDirectivasErrorMessage } from '../components/juntasDirectivasUi';
import {
  createJuntaDirectiva,
  deleteJuntaDirectiva,
  getJuntaDirectivaById,
  getJuntasDirectivas,
  updateJuntaDirectiva,
} from '../services/juntasDirectivas.service';
import type {
  JuntaDirectiva,
  JuntaDirectivaCreateDto,
  JuntasDirectivasListQuery,
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

export function useJuntasDirectivas() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<JuntaDirectiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<JuntasDirectivasListQuery['estado']>('TODOS');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingJuntaId, setEditingJuntaId] = useState<string | number | null>(null);
  const [formJunta, setFormJunta] = useState<JuntaDirectiva | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJuntaId, setDetailJuntaId] = useState<string | number | null>(null);
  const [detailJunta, setDetailJunta] = useState<JuntaDirectiva | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JuntaDirectiva | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadJuntasDirectivas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getJuntasDirectivas(
          tenantId,
          {
            estado: estadoFilter,
            from: fromFilter,
            to: toFilter,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            getJuntasDirectivasErrorMessage(
              loadError,
              'No se pudo cargar la lista de juntas directivas.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJuntasDirectivas();

    return () => {
      controller.abort();
    };
  }, [tenantId, estadoFilter, fromFilter, toFilter, reloadKey]);

  useEffect(() => {
    if (!formOpen) {
      setFormJunta(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormJunta(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingJuntaId) {
      setFormLoadError('No se pudo identificar la junta directiva a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadJunta = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const junta = await getJuntaDirectivaById(tenantId, editingJuntaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormJunta(junta);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(
            getJuntasDirectivasErrorMessage(loadError, 'No se pudo cargar la junta directiva.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadJunta();

    return () => {
      controller.abort();
    };
  }, [editingJuntaId, formMode, formOpen, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailJunta(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailJuntaId) {
      setDetailError('No se pudo identificar la junta directiva solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadJunta = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await getJuntaDirectivaById(tenantId, detailJuntaId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailJunta(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(
            getJuntasDirectivasErrorMessage(
              loadError,
              'No se pudo cargar el detalle de la junta directiva.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadJunta();

    return () => {
      controller.abort();
    };
  }, [detailJuntaId, detailOpen, tenantId]);

  const showMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  const retry = () => {
    setReloadKey((current) => current + 1);
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingJuntaId(null);
    setFormJunta(null);
    setFormOpen(true);
  };

  const openEditDialog = (junta: JuntaDirectiva) => {
    setFormMode('edit');
    setEditingJuntaId(junta.idJunta);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingJuntaId(null);
  };

  const submitForm = async (payload: JuntaDirectivaCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingJuntaId) {
      showMessage('No se pudo identificar la junta directiva a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateJuntaDirectiva(tenantId, editingJuntaId!, payload);
        setFormOpen(false);
        setEditingJuntaId(null);
        setReloadKey((current) => current + 1);
        showMessage('Junta directiva actualizada correctamente', 'success');
      } else {
        await createJuntaDirectiva(tenantId, payload);
        setFormOpen(false);
        setEditingJuntaId(null);
        setReloadKey((current) => current + 1);
        showMessage('Junta directiva creada correctamente', 'success');
      }
    } catch (submitError) {
      showMessage(
        getJuntasDirectivasErrorMessage(submitError, 'No se pudo guardar la junta directiva.'),
        'error',
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetailDialog = (junta: JuntaDirectiva) => {
    setDetailJuntaId(junta.idJunta);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailJuntaId(null);
  };

  const openDeleteDialog = (junta: JuntaDirectiva) => {
    setDeleteTarget(junta);
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
      await deleteJuntaDirectiva(tenantId, deleteTarget.idJunta);
      setRows((current) =>
        current.filter((junta) => String(junta.idJunta) !== String(deleteTarget.idJunta)),
      );
      setDeleteTarget(null);
      showMessage('Junta directiva eliminada correctamente', 'success');
    } catch (deleteError) {
      showMessage(
        getJuntasDirectivasErrorMessage(deleteError, 'No se pudo eliminar la junta directiva.'),
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setEstadoFilter('TODOS');
    setFromFilter('');
    setToFilter('');
  };

  return {
    tenantId,
    isDesktop,
    rows,
    loading,
    error,
    estadoFilter,
    fromFilter,
    toFilter,
    formOpen,
    formMode,
    formJunta,
    formLoading,
    formSubmitting,
    formLoadError,
    detailOpen,
    detailJunta,
    detailLoading,
    detailError,
    deleteLoading,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteTargetName: deleteTarget ? getJuntaDirectivaLabel(deleteTarget) : undefined,
    toast,
    showEmptyState: !loading && !error && rows.length === 0,
    setEstadoFilter,
    setFromFilter,
    setToFilter,
    retry,
    closeToast,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    openDetailDialog,
    closeDetailDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    clearFilters,
  };
}
