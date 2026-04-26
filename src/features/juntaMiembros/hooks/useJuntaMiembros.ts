import { useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import { getJuntasDirectivas } from '../../juntasDirectivas/services/juntasDirectivas.service';
import { getPersonaById, getPersonas } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import {
  getJuntaMiembroErrorMessage,
  getJuntaMiembroLabel,
} from '../components/juntaMiembrosUi';
import {
  createJuntaMiembro,
  deleteJuntaMiembro,
  getJuntaMiembroById,
  getJuntaMiembros,
  updateJuntaMiembro,
} from '../services/juntaMiembros.service';
import type { JuntaMiembro, JuntaMiembroCreateDto } from '../types';

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

function mergePersonas(
  current: Record<string, Persona>,
  personas: Persona[],
) {
  const next = { ...current };

  personas.forEach((persona) => {
    next[String(persona.idPersona)] = persona;
  });

  return next;
}

export function useJuntaMiembros() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [juntas, setJuntas] = useState<JuntaDirectiva[]>([]);
  const [personaCache, setPersonaCache] = useState<Record<string, Persona>>({});
  const [rows, setRows] = useState<JuntaMiembro[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedJuntaId, setSelectedJuntaId] = useState('');
  const [contextReloadKey, setContextReloadKey] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingJuntaMiembroId, setEditingJuntaMiembroId] = useState<string | number | null>(null);
  const [formJuntaMiembro, setFormJuntaMiembro] = useState<JuntaMiembro | null>(null);
  const [formSelectedPersona, setFormSelectedPersona] = useState<Persona | null>(null);
  const [formInitialPersonaOptions, setFormInitialPersonaOptions] = useState<Persona[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [hasEligiblePersonas, setHasEligiblePersonas] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJuntaMiembroId, setDetailJuntaMiembroId] = useState<string | number | null>(null);
  const [detailJuntaMiembro, setDetailJuntaMiembro] = useState<JuntaMiembro | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JuntaMiembro | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  const cachePersonas = useCallback((personas: Persona[]) => {
    if (personas.length === 0) {
      return;
    }

    setPersonaCache((current) => mergePersonas(current, personas));
  }, []);

  useEffect(() => {
    if (!tenantId) {
      setJuntas([]);
      setPersonaCache({});
      setRows([]);
      setLoadingContext(false);
      setLoadingRows(false);
      setContextError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadContext = async () => {
      setLoadingContext(true);
      setContextError(null);
      setPersonaCache({});

      try {
        const juntasResponse = await getJuntasDirectivas(
          tenantId,
          {
            estado: 'TODOS',
            from: '',
            to: '',
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setJuntas(juntasResponse);
          setSelectedJuntaId((current) => {
            if (current && juntasResponse.some((junta) => String(junta.idJunta) === current)) {
              return current;
            }

            const defaultJunta = juntasResponse.find((junta) => junta.estado === 'VIGENTE') ?? juntasResponse[0];
            return defaultJunta ? String(defaultJunta.idJunta) : '';
          });
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setContextError(
            getJuntaMiembroErrorMessage(
              loadError,
              'No se pudieron cargar las juntas directivas del tenant.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingContext(false);
        }
      }
    };

    void loadContext();

    return () => {
      controller.abort();
    };
  }, [contextReloadKey, tenantId]);

  useEffect(() => {
    if (!tenantId || !selectedJuntaId) {
      setRows([]);
      setLoadingRows(false);
      setListError(null);
      return;
    }

    const controller = new AbortController();

    const loadJuntaMiembros = async () => {
      setLoadingRows(true);
      setListError(null);

      try {
        const response = await getJuntaMiembros(
          tenantId,
          {
            idJunta: selectedJuntaId,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setListError(
            getJuntaMiembroErrorMessage(loadError, 'No se pudo cargar la lista de miembros de junta.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRows(false);
        }
      }
    };

    void loadJuntaMiembros();

    return () => {
      controller.abort();
    };
  }, [reloadKey, selectedJuntaId, tenantId]);

  useEffect(() => {
    if (!tenantId || rows.length === 0) {
      return;
    }

    const missingIds = Array.from(
      new Set(
        rows
          .map((row) => String(row.idPersona))
          .filter((idPersona) => !personaCache[idPersona]),
      ),
    );

    if (missingIds.length === 0) {
      return;
    }

    const controller = new AbortController();

    const resolveMissingPersonas = async () => {
      const resolved = await Promise.all(
        missingIds.map(async (idPersona) => {
          try {
            return await getPersonaById(tenantId, idPersona, controller.signal);
          } catch {
            return null;
          }
        }),
      );

      if (!controller.signal.aborted) {
        cachePersonas(resolved.filter((persona): persona is Persona => Boolean(persona)));
      }
    };

    void resolveMissingPersonas();

    return () => {
      controller.abort();
    };
  }, [cachePersonas, personaCache, rows, tenantId]);

  useEffect(() => {
    if (!formOpen || !tenantId) {
      return;
    }

    const controller = new AbortController();

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      setFormInitialPersonaOptions([]);

      try {
        const response = await getPersonas(
          tenantId,
          {
            page: 1,
            pageSize: 20,
            search: '',
            dni: '',
            estado: 'ACTIVO',
            tipoParticipante: 'PADRONADO',
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setFormInitialPersonaOptions(response.items);
          setHasEligiblePersonas(response.total > 0);
          cachePersonas(response.items);
        }
      } catch {
        if (!controller.signal.aborted) {
          setFormInitialPersonaOptions([]);
          setHasEligiblePersonas(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingAvailability(false);
        }
      }
    };

    void checkAvailability();

    return () => {
      controller.abort();
    };
  }, [cachePersonas, formOpen, tenantId]);

  useEffect(() => {
    if (!formOpen) {
      setFormJuntaMiembro(null);
      setFormSelectedPersona(null);
      setFormLoadError(null);
      setFormSubmitting(false);
      return;
    }

    if (formMode === 'create') {
      setFormJuntaMiembro(null);
      setFormSelectedPersona(null);
      setFormLoadError(null);
      setFormLoading(false);
      return;
    }

    if (!tenantId || !editingJuntaMiembroId) {
      setFormLoadError('No se pudo identificar el miembro de junta a editar.');
      setFormLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadJuntaMiembro = async () => {
      setFormLoading(true);
      setFormLoadError(null);

      try {
        const juntaMiembro = await getJuntaMiembroById(tenantId, editingJuntaMiembroId, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setFormJuntaMiembro(juntaMiembro);

        const cachedPersona = personaCache[String(juntaMiembro.idPersona)];

        if (cachedPersona) {
          setFormSelectedPersona(cachedPersona);
        } else {
          try {
            const persona = await getPersonaById(tenantId, juntaMiembro.idPersona, controller.signal);

            if (!controller.signal.aborted) {
              setFormSelectedPersona(persona);
              cachePersonas([persona]);
            }
          } catch {
            setFormSelectedPersona(null);
          }
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setFormLoadError(
            getJuntaMiembroErrorMessage(loadError, 'No se pudo cargar el miembro de junta.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      }
    };

    void loadJuntaMiembro();

    return () => {
      controller.abort();
    };
  }, [cachePersonas, editingJuntaMiembroId, formMode, formOpen, personaCache, tenantId]);

  useEffect(() => {
    if (!detailOpen) {
      setDetailJuntaMiembro(null);
      setDetailError(null);
      return;
    }

    if (!tenantId || !detailJuntaMiembroId) {
      setDetailError('No se pudo identificar el miembro de junta solicitado.');
      return;
    }

    const controller = new AbortController();

    const loadJuntaMiembro = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await getJuntaMiembroById(tenantId, detailJuntaMiembroId, controller.signal);

        if (!controller.signal.aborted) {
          setDetailJuntaMiembro(response);

          if (!personaCache[String(response.idPersona)]) {
            try {
              const persona = await getPersonaById(tenantId, response.idPersona, controller.signal);

              if (!controller.signal.aborted) {
                cachePersonas([persona]);
              }
            } catch {
              // Mantiene fallback Persona #id cuando no se puede resolver el nombre.
            }
          }
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setDetailError(
            getJuntaMiembroErrorMessage(
              loadError,
              'No se pudo cargar el detalle del miembro de junta.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    };

    void loadJuntaMiembro();

    return () => {
      controller.abort();
    };
  }, [cachePersonas, detailJuntaMiembroId, detailOpen, personaCache, tenantId]);

  const hasJuntas = juntas.length > 0;
  const showNoJuntasState = !loadingContext && !contextError && !hasJuntas;
  const showEmptyState = !loadingRows && !listError && hasJuntas && rows.length === 0;
  const selectedJunta = useMemo(
    () => juntas.find((junta) => String(junta.idJunta) === selectedJuntaId) ?? null,
    [juntas, selectedJuntaId],
  );

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

  const retryContext = () => {
    setContextReloadKey((current) => current + 1);
  };

  const retryList = () => {
    setReloadKey((current) => current + 1);
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setEditingJuntaMiembroId(null);
    setFormOpen(true);
  };

  const openEditDialog = (juntaMiembro: JuntaMiembro) => {
    setFormMode('edit');
    setEditingJuntaMiembroId(juntaMiembro.idJuntaMiembro);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (formSubmitting) {
      return;
    }

    setFormOpen(false);
    setEditingJuntaMiembroId(null);
  };

  const openDetailDialog = (juntaMiembro: JuntaMiembro) => {
    setDetailJuntaMiembroId(juntaMiembro.idJuntaMiembro);
    setDetailOpen(true);
  };

  const closeDetailDialog = () => {
    setDetailOpen(false);
    setDetailJuntaMiembroId(null);
  };

  const openDeleteDialog = (juntaMiembro: JuntaMiembro) => {
    setDeleteTarget(juntaMiembro);
  };

  const closeDeleteDialog = () => {
    if (!deleteLoading) {
      setDeleteTarget(null);
    }
  };

  const submitForm = async (payload: JuntaMiembroCreateDto) => {
    if (!tenantId) {
      showMessage('No se pudo identificar la junta activa.', 'error');
      return;
    }

    if (formMode === 'edit' && !editingJuntaMiembroId) {
      showMessage('No se pudo identificar el miembro de junta a editar.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === 'edit') {
        await updateJuntaMiembro(tenantId, editingJuntaMiembroId!, payload);
        showMessage('Miembro de junta actualizado correctamente', 'success');
      } else {
        await createJuntaMiembro(tenantId, payload);
        showMessage('Miembro de junta creado correctamente', 'success');
      }

      setFormOpen(false);
      setEditingJuntaMiembroId(null);
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      showMessage(
        getJuntaMiembroErrorMessage(submitError, 'No se pudo guardar el miembro de junta.'),
        'error',
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!tenantId || !deleteTarget) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteJuntaMiembro(tenantId, deleteTarget.idJuntaMiembro);
      setRows((current) =>
        current.filter(
          (juntaMiembro) =>
            String(juntaMiembro.idJuntaMiembro) !== String(deleteTarget.idJuntaMiembro),
        ),
      );
      setDeleteTarget(null);
      showMessage('Miembro de junta eliminado correctamente', 'success');
    } catch (deleteError) {
      showMessage(
        getJuntaMiembroErrorMessage(deleteError, 'No se pudo eliminar el miembro de junta.'),
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const searchPersonas = async (search: string, signal?: AbortSignal) => {
    if (!tenantId) {
      return [];
    }

    const response = await getPersonas(
      tenantId,
      {
        page: 1,
        pageSize: 20,
        search,
        dni: '',
        estado: 'ACTIVO',
        tipoParticipante: 'PADRONADO',
      },
      signal,
    );

    cachePersonas(response.items);
    return response.items;
  };

  const handlePersonaSelected = (persona: Persona | null) => {
    setFormSelectedPersona(persona);

    if (persona) {
      cachePersonas([persona]);
    }
  };

  const handleJuntaChange = (value: string) => {
    setSelectedJuntaId(value);
  };

  return {
    tenantId,
    isDesktop,
    juntas,
    personaCache,
    rows,
    loadingContext,
    loadingRows,
    contextError,
    listError,
    selectedJuntaId,
    hasJuntas,
    showNoJuntasState,
    showEmptyState,
    selectedJunta,
    formOpen,
    formMode,
    formJuntaMiembro,
    formSelectedPersona,
    formInitialPersonaOptions,
    formLoading,
    formSubmitting,
    formLoadError,
    checkingAvailability,
    hasEligiblePersonas,
    detailOpen,
    detailJuntaMiembro,
    detailLoading,
    detailError,
    deleteDialogOpen: Boolean(deleteTarget),
    deleteLoading,
    deleteTargetLabel: deleteTarget ? getJuntaMiembroLabel(deleteTarget, personaCache) : undefined,
    toast,
    handleJuntaChange,
    retryContext,
    retryList,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    openDetailDialog,
    closeDetailDialog,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    searchPersonas,
    handlePersonaSelected,
    closeToast,
  };
}
