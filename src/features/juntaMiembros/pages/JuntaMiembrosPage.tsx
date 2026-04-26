import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import { getPersonaById } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import { getJuntasDirectivas } from '../../juntasDirectivas/services/juntasDirectivasApi';
import { ConfirmDeleteJuntaMiembroDialog } from '../components/ConfirmDeleteJuntaMiembroDialog';
import { JuntaMiembroDetailDialog } from '../components/JuntaMiembroDetailDialog';
import { JuntaMiembroFormDialog } from '../components/JuntaMiembroFormDialog';
import { JuntaMiembrosFiltersCard } from '../components/JuntaMiembrosFiltersCard';
import { JuntaMiembrosMobileList } from '../components/JuntaMiembrosMobileList';
import { JuntaMiembrosTable } from '../components/JuntaMiembrosTable';
import {
  getJuntaMiembroErrorMessage,
  getJuntaMiembroLabel,
  getPersonaLabelById,
} from '../components/juntaMiembrosUi';
import {
  deleteJuntaMiembro,
  getJuntaMiembros,
} from '../services/juntaMiembrosApi';
import type { JuntaMiembro } from '../types';

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

export function JuntaMiembrosPage() {
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJuntaMiembroId, setDetailJuntaMiembroId] = useState<string | number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JuntaMiembro | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToastState);

  const cachePersonas = useCallback((personas: Persona[]) => {
    if (personas.length === 0) {
      return;
    }

    setPersonaCache((current) => mergePersonas(current, personas));
  }, []);

  const handlePersonaResolved = useCallback((persona: Persona) => {
    cachePersonas([persona]);
  }, [cachePersonas]);

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
      } catch (error) {
        if (!controller.signal.aborted) {
          setContextError(
            getJuntaMiembroErrorMessage(
              error,
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
      } catch (error) {
        if (!controller.signal.aborted) {
          setListError(
            getJuntaMiembroErrorMessage(error, 'No se pudo cargar la lista de miembros de junta.'),
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
  }, [personaCache, rows, tenantId]);

  const hasJuntas = juntas.length > 0;
  const showNoJuntasState = !loadingContext && !contextError && !hasJuntas;
  const showEmptyState = !loadingRows && !listError && hasJuntas && rows.length === 0;
  const selectedJunta = useMemo(
    () => juntas.find((junta) => String(junta.idJunta) === selectedJuntaId) ?? null,
    [juntas, selectedJuntaId],
  );

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleOpenCreateDialog = () => {
    setFormMode('create');
    setEditingJuntaMiembroId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (juntaMiembro: JuntaMiembro) => {
    setFormMode('edit');
    setEditingJuntaMiembroId(juntaMiembro.idJuntaMiembro);
    setFormOpen(true);
  };

  const handleOpenDetail = (juntaMiembro: JuntaMiembro) => {
    setDetailJuntaMiembroId(juntaMiembro.idJuntaMiembro);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingJuntaMiembroId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmDelete = async () => {
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
      handleShowMessage('Miembro de junta eliminado correctamente', 'success');
    } catch (error) {
      handleShowMessage(
        getJuntaMiembroErrorMessage(error, 'No se pudo eliminar el miembro de junta.'),
        'error',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleJuntaChange = (value: string) => {
    setSelectedJuntaId(value);
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {isDesktop && hasJuntas && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nuevo miembro
            </Button>
          </Stack>
        )}

        {contextError && (
          <Alert
            action={
              <Button color="inherit" onClick={() => setContextReloadKey((current) => current + 1)} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {contextError}
          </Alert>
        )}

        {loadingContext ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showNoJuntasState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">Debes crear al menos una junta directiva</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 480 }} variant="body2">
                Antes de registrar miembros de junta necesitas contar con al menos una junta directiva creada.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <JuntaMiembrosFiltersCard
              juntas={juntas}
              onJuntaChange={handleJuntaChange}
              selectedJuntaId={selectedJuntaId}
            />

            {listError && (
              <Alert
                action={
                  <Button color="inherit" onClick={() => setReloadKey((current) => current + 1)} size="small">
                    Reintentar
                  </Button>
                }
                severity="error"
              >
                {listError}
              </Alert>
            )}

            {loadingRows ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <LinearProgress sx={{ borderRadius: 999 }} />
                </CardContent>
              </Card>
            ) : showEmptyState ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">No hay miembros registrados</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 480 }} variant="body2">
                    {selectedJunta
                      ? `La ${selectedJunta.nombre || 'junta seleccionada'} aun no tiene miembros registrados con los filtros actuales.`
                      : 'Selecciona una junta directiva para comenzar a registrar miembros.'}
                  </Typography>
                  <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                    Nuevo miembro
                  </Button>
                </CardContent>
              </Card>
            ) : isDesktop ? (
              <Card elevation={0}>
                <JuntaMiembrosTable
                  getPersonaLabel={(idPersona) => getPersonaLabelById(personaCache, idPersona)}
                  onDelete={setDeleteTarget}
                  onEdit={handleOpenEditDialog}
                  onView={handleOpenDetail}
                  rows={rows}
                />
              </Card>
            ) : (
              <JuntaMiembrosMobileList
                getPersonaLabel={(idPersona) => getPersonaLabelById(personaCache, idPersona)}
                onDelete={setDeleteTarget}
                onEdit={handleOpenEditDialog}
                onView={handleOpenDetail}
                rows={rows}
              />
            )}
          </>
        )}
      </Stack>

      {!isDesktop && hasJuntas && (
        <Fab
          color="primary"
          onClick={handleOpenCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {tenantId && hasJuntas && (
        <>
          <JuntaMiembroFormDialog
            defaultJuntaId={selectedJuntaId}
            juntaMiembroId={editingJuntaMiembroId}
            juntas={juntas}
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingJuntaMiembroId(null);
            }}
            onPersonaResolved={cachePersonas}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            personaCache={personaCache}
            tenantId={tenantId}
          />
          <JuntaMiembroDetailDialog
            juntaMiembroId={detailJuntaMiembroId}
            juntas={juntas}
            onClose={() => {
              setDetailOpen(false);
              setDetailJuntaMiembroId(null);
            }}
            onPersonaResolved={handlePersonaResolved}
            open={detailOpen}
            personaCache={personaCache}
            tenantId={tenantId}
          />
        </>
      )}

      <ConfirmDeleteJuntaMiembroDialog
        juntaMiembroLabel={deleteTarget ? getJuntaMiembroLabel(deleteTarget, personaCache) : undefined}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        open={Boolean(deleteTarget)}
      />

      <Toast
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        open={toast.open}
        severity={toast.severity}
      />
    </Box>
  );
}
