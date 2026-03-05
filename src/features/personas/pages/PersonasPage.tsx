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
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { useTenant } from '../../tenant/context/TenantContext';
import { ConfirmRetireDialog } from '../components/ConfirmRetireDialog';
import { ExportPersonasDialog } from '../components/ExportPersonasDialog';
import { PersonaDetailDialog } from '../components/PersonaDetailDialog';
import { PersonaFiltersCard } from '../components/PersonaFiltersCard';
import { PersonaFormDialog } from '../components/PersonaFormDialog';
import { PersonaMobileList } from '../components/PersonaMobileList';
import { PersonaTable } from '../components/PersonaTable';
import { getFullName, getPersonaErrorMessage } from '../components/personaUi';
import {
  exportPersonasToExcel,
  exportPersonasToPdf,
  getPersonasForExport,
} from '../services/personasExport';
import { getPersonas, retirePersona } from '../services/personasApi';
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

export function PersonasPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPersonaId, setDetailPersonaId] = useState<string | number | null>(null);
  const [retireTarget, setRetireTarget] = useState<Persona | null>(null);
  const [retireLoading, setRetireLoading] = useState(false);
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

  const handleShowMessage = (message: string, severity: ToastState['severity']) => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleReachEnd = () => {
    if (nextPageLockRef.current || initialLoading || loadingMore || !hasMore || Boolean(error)) {
      return;
    }

    nextPageLockRef.current = true;
    setPage((current) => current + 1);
  };

  const handleOpenCreateDialog = () => {
    setFormMode('create');
    setEditingPersonaId(null);
    setFormOpen(true);
  };

  const handleOpenEditDialog = (persona: Persona) => {
    setFormMode('edit');
    setEditingPersonaId(persona.idPersona);
    setFormOpen(true);
  };

  const handleOpenDetail = (persona: Persona) => {
    setDetailPersonaId(persona.idPersona);
    setDetailOpen(true);
  };

  const handleSaved = (message: string) => {
    setFormOpen(false);
    setEditingPersonaId(null);
    setReloadKey((current) => current + 1);
    handleShowMessage(message, 'success');
  };

  const handleConfirmRetire = async () => {
    if (!tenantId || !retireTarget) {
      return;
    }

    setRetireLoading(true);

    try {
      await retirePersona(tenantId, retireTarget.idPersona);
      setRetireTarget(null);
      setReloadKey((current) => current + 1);
      handleShowMessage('Persona retirada correctamente', 'success');
    } catch (retireError) {
      handleShowMessage(getPersonaErrorMessage(retireError, 'No se pudo retirar la persona.'), 'error');
    } finally {
      setRetireLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDniFilter('');
    setEstadoFilter('TODOS');
    setTipoParticipanteFilter('TODOS');
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!tenantId) {
      handleShowMessage('No se pudo identificar la junta activa.', 'error');
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
        handleShowMessage('No hay personas para exportar con los filtros actuales.', 'info');
        return;
      }

      const reportMetadata = {
        tenantName: tenant?.nombre ?? 'Junta activa',
      };

      if (format === 'pdf') {
        exportPersonasToPdf(personas, reportMetadata);
        handleShowMessage('Listado exportado en formato PDF.', 'success');
      } else {
        exportPersonasToExcel(personas, reportMetadata);
        handleShowMessage('Listado exportado en formato Excel.', 'success');
      }

      setExportOpen(false);
    } catch (exportError) {
      handleShowMessage(
        getPersonaErrorMessage(exportError, 'No se pudo exportar el listado de personas.'),
        'error',
      );
    } finally {
      setExportLoading(false);
    }
  };

  const showEmptyState = !initialLoading && !error && rows.length === 0;

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva persona
            </Button>
          </Stack>
        )}

        <PersonaFiltersCard
          dniValue={dniFilter}
          exportLoading={exportLoading}
          estadoValue={estadoFilter}
          isDesktop={isDesktop}
          onClear={handleClearFilters}
          onDniChange={setDniFilter}
          onEstadoChange={setEstadoFilter}
          onExportClick={() => setExportOpen(true)}
          onSearchChange={setSearchInput}
          onTipoChange={setTipoParticipanteFilter}
          searchValue={searchInput}
          tipoValue={tipoParticipanteFilter}
        />

        {error && (
          <Alert
            action={
              <Button color="inherit" onClick={() => setReloadKey((current) => current + 1)} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {error}
          </Alert>
        )}

        {initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay personas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 420 }} variant="body2">
                Ajusta la búsqueda o crea una nueva persona para comenzar a poblar el padrón.
              </Typography>
              <Button onClick={handleOpenCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva persona
              </Button>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card elevation={0}>
            <PersonaTable
              hasMore={hasMore}
              onEdit={handleOpenEditDialog}
              onReachEnd={handleReachEnd}
              onRetire={setRetireTarget}
              onView={handleOpenDetail}
              loadingMore={loadingMore}
              rows={rows}
            />
          </Card>
        ) : (
          <PersonaMobileList
            hasMore={hasMore}
            onEdit={handleOpenEditDialog}
            onReachEnd={handleReachEnd}
            onRetire={setRetireTarget}
            onView={handleOpenDetail}
            loadingMore={loadingMore}
            rows={rows}
            total={total}
          />
        )}
      </Stack>

      {!isDesktop && (
        <Fab
          color="primary"
          onClick={handleOpenCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {tenantId && (
        <>
          <ExportPersonasDialog
            loading={exportLoading}
            onClose={() => setExportOpen(false)}
            onExportExcel={() => {
              void handleExport('excel');
            }}
            onExportPdf={() => {
              void handleExport('pdf');
            }}
            open={exportOpen}
          />
          <PersonaFormDialog
            mode={formMode}
            onClose={() => {
              setFormOpen(false);
              setEditingPersonaId(null);
            }}
            onSaved={handleSaved}
            onShowMessage={handleShowMessage}
            open={formOpen}
            personaId={editingPersonaId}
            tenantId={tenantId}
          />
          <PersonaDetailDialog
            onClose={() => {
              setDetailOpen(false);
              setDetailPersonaId(null);
            }}
            open={detailOpen}
            personaId={detailPersonaId}
            tenantId={tenantId}
          />
        </>
      )}

      <ConfirmRetireDialog
        loading={retireLoading}
        onClose={() => {
          if (!retireLoading) {
            setRetireTarget(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmRetire();
        }}
        open={Boolean(retireTarget)}
        personaName={retireTarget ? getFullName(retireTarget) : undefined}
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
