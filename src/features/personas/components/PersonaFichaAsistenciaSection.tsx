import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import type { PersonaFichaAsistenciaFilter } from '../hooks/usePersonaFichaPage';
import type { PersonaAsistenciaFicha, PersonaFichaPaginatedResponse, PersonaFichaSectionState } from '../types';
import {
  formatFichaDate,
  formatFichaMoney,
  formatFichaTime,
  getAsistenciaStatusChipProps,
} from './personaFichaUi';

type PersonaFichaAsistenciaSectionProps = {
  state: PersonaFichaSectionState<PersonaFichaPaginatedResponse<PersonaAsistenciaFicha>>;
  filter: PersonaFichaAsistenciaFilter;
  canLoadMore: boolean;
  onFilterChange: (filter: PersonaFichaAsistenciaFilter) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

const filters: Array<{ value: PersonaFichaAsistenciaFilter; label: string }> = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'FAENA', label: 'Faenas' },
  { value: 'ASAMBLEA', label: 'Asambleas' },
];

export function PersonaFichaAsistenciaSection({
  state,
  filter,
  canLoadMore,
  onFilterChange,
  onLoadMore,
  onRetry,
}: PersonaFichaAsistenciaSectionProps) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.25 }}>
        {filters.map((item) => (
          <Button
            key={item.value}
            onClick={() => onFilterChange(item.value)}
            size="small"
            variant={filter === item.value ? 'contained' : 'outlined'}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      {state.status === 'loading' && !state.data ? (
        <SectionLoading label="Cargando asistencias..." />
      ) : state.status === 'error' ? (
        <SectionError message={state.error} onRetry={onRetry} />
      ) : state.data && state.data.items.length > 0 ? (
        <>
          <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            {state.data.items.map((item) => (
              <Card key={`${item.tipoEvento}-${item.idAsistencia}`} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography color="text.secondary" variant="caption">
                        {formatFichaDate(item.fecha)} · {item.tipoEvento}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                        {item.nombreEvento}
                      </Typography>
                      <Stack spacing={0.25} sx={{ mt: 0.75 }}>
                        {formatFichaTime(item.horaLlegada) ? (
                          <Typography color="text.secondary" variant="caption">
                            Hora: {formatFichaTime(item.horaLlegada)}
                          </Typography>
                        ) : null}
                        {item.montoMulta !== null ? (
                          <Typography color="error.main" variant="caption">
                            Multa: {formatFichaMoney(item.montoMulta)}
                          </Typography>
                        ) : null}
                        {item.observacion ? (
                          <Typography color="text.secondary" variant="caption">
                            {item.observacion}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Chip size="small" {...getAsistenciaStatusChipProps(item.estado)} />
                      {item.estadoObligacion ? (
                        <Chip label={item.estadoObligacion} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
          <LoadMoreButton canLoadMore={canLoadMore} loading={state.status === 'loading'} onLoadMore={onLoadMore} />
        </>
      ) : (
        <Alert severity="info">No se encontraron asistencias para esta persona.</Alert>
      )}
    </Stack>
  );
}

function SectionLoading({ label }: { label: string }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <CircularProgress size={18} />
          <Typography color="text.secondary" variant="body2">{label}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <Alert action={<Button color="inherit" onClick={onRetry} size="small">Reintentar</Button>} severity="error">
      {message ?? 'No se pudo cargar la información.'}
    </Alert>
  );
}

function LoadMoreButton({
  canLoadMore,
  loading,
  onLoadMore,
}: {
  canLoadMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  if (!canLoadMore) {
    return null;
  }

  return (
    <Stack alignItems="center">
      <Button disabled={loading} onClick={onLoadMore} variant="outlined">
        {loading ? 'Cargando...' : 'Cargar más'}
      </Button>
    </Stack>
  );
}
