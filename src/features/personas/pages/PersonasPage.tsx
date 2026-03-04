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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmRetireDialog } from '../components/ConfirmRetireDialog';
import { PersonaDetailDialog } from '../components/PersonaDetailDialog';
import { PersonaFiltersCard } from '../components/PersonaFiltersCard';
import { PersonaFormDialog } from '../components/PersonaFormDialog';
import { PersonaMobileList } from '../components/PersonaMobileList';
import { PersonaTable } from '../components/PersonaTable';
import { getFullName, getPersonaErrorMessage } from '../components/personaUi';
import { getPersonas, retirePersona } from '../services/personasApi';
import type { ListQuery, Persona } from '../types';

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [rows, setRows] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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
    setPage(1);
  }, [debouncedSearch, dniFilter, estadoFilter, tipoParticipanteFilter, pageSize]);

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    setEstadoFilter('TODOS');
    setTipoParticipanteFilter('TODOS');
    setDniFilter('');
  }, [isDesktop]);

  useEffect(() => {
    if (!tenantId) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      setError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadPersonas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPersonas(
          tenantId,
          buildListQuery(
            page,
            pageSize,
            debouncedSearch,
            isDesktop ? dniFilter : '',
            isDesktop ? estadoFilter : 'TODOS',
            isDesktop ? tipoParticipanteFilter : 'TODOS',
          ),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setRows(response.items);
          setTotal(response.total);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getPersonaErrorMessage(loadError, 'No se pudo cargar la lista de personas.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
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
    pageSize,
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

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
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
    setPage(1);
  };

  const showEmptyState = !loading && !error && rows.length === 0;

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderColor: 'divider',
            background:
              'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 52%, rgba(243,244,246,0.9) 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack
              alignItems={{ xs: 'stretch', md: 'center' }}
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 800, lineHeight: 1.05 }}>
                  Personas
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
                  Gestiona personas, invitados y sus estados dentro de la junta activa.
                </Typography>
                {loading && <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />}
              </Box>
              {isDesktop && (
                <Button onClick={handleOpenCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
                  Nueva persona
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <PersonaFiltersCard
          dniValue={dniFilter}
          estadoValue={estadoFilter}
          isDesktop={isDesktop}
          onClear={handleClearFilters}
          onDniChange={setDniFilter}
          onEstadoChange={setEstadoFilter}
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

        {showEmptyState ? (
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
              onEdit={handleOpenEditDialog}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onRetire={setRetireTarget}
              onView={handleOpenDetail}
              page={page}
              pageSize={pageSize}
              rows={rows}
              total={total}
            />
          </Card>
        ) : (
          <PersonaMobileList
            onEdit={handleOpenEditDialog}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onRetire={setRetireTarget}
            onView={handleOpenDetail}
            page={page}
            pageSize={pageSize}
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
