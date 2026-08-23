import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import type { PersonaFichaObligacionFilter } from '../hooks/usePersonaFichaPage';
import type { PersonaFichaPaginatedResponse, PersonaFichaSectionState, PersonaObligacionFicha } from '../types';
import {
  formatFichaDate,
  formatFichaMoney,
  getObligacionStatusChipProps,
  normalizeFichaLabel,
} from './personaFichaUi';

type PersonaFichaObligacionesSectionProps = {
  state: PersonaFichaSectionState<PersonaFichaPaginatedResponse<PersonaObligacionFicha>>;
  filter: PersonaFichaObligacionFilter;
  canLoadMore: boolean;
  onFilterChange: (filter: PersonaFichaObligacionFilter) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

const filters: Array<{ value: PersonaFichaObligacionFilter; label: string }> = [
  { value: 'PENDIENTES', label: 'Pendientes' },
  { value: 'PAGADAS', label: 'Pagadas' },
  { value: 'TODAS', label: 'Todas' },
];

export function PersonaFichaObligacionesSection({
  state,
  filter,
  canLoadMore,
  onFilterChange,
  onLoadMore,
  onRetry,
}: PersonaFichaObligacionesSectionProps) {
  const items = state.data?.items ?? [];
  const pendienteTotal = items.reduce((total, item) => total + item.saldoPendiente, 0);
  const pagadas = items.filter((item) => item.estado === 'PAGADA').length;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
        <Metric label="Pendiente cargado" tone="error" value={formatFichaMoney(pendienteTotal)} />
        <Metric label="Obligaciones" value={String(state.data?.total ?? 0)} />
        <Metric label="Pagadas cargadas" value={String(pagadas)} />
      </Box>

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
        <SectionLoading label="Cargando obligaciones..." />
      ) : state.status === 'error' ? (
        <SectionError message={state.error} onRetry={onRetry} />
      ) : items.length > 0 ? (
        <>
          <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
            {items.map((item) => (
              <Card key={item.idObligacion} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography color="text.secondary" variant="caption">
                        {formatFichaDate(item.fecha)} · {normalizeFichaLabel(item.origen)}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                        {item.concepto}
                      </Typography>
                      {item.eventoRelacionado ? (
                        <Typography color="text.secondary" variant="caption">
                          {item.eventoRelacionado.nombreEvento}
                        </Typography>
                      ) : null}
                      {item.descripcion ? (
                        <Typography color="text.secondary" variant="caption">
                          {item.descripcion}
                        </Typography>
                      ) : null}
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Typography color={item.saldoPendiente > 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 900 }}>
                        {formatFichaMoney(item.saldoPendiente > 0 ? item.saldoPendiente : item.importeOriginal)}
                      </Typography>
                      <Chip size="small" {...getObligacionStatusChipProps(item.estado)} />
                    </Stack>
                  </Stack>
                  {item.idAsistencia ? (
                    <Button disabled size="small" sx={{ mt: 1 }} variant="text">
                      Ver asistencia relacionada
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </Box>
          <LoadMoreButton canLoadMore={canLoadMore} loading={state.status === 'loading'} onLoadMore={onLoadMore} />
        </>
      ) : (
        <Alert severity="info">No se encontraron obligaciones para esta persona.</Alert>
      )}
    </Stack>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'error' }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography color="text.secondary" variant="caption">{label}</Typography>
        <Typography sx={{ color: tone === 'error' ? 'error.main' : 'text.primary', fontSize: 24, fontWeight: 900 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
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

function LoadMoreButton({ canLoadMore, loading, onLoadMore }: { canLoadMore: boolean; loading: boolean; onLoadMore: () => void }) {
  return canLoadMore ? (
    <Stack alignItems="center">
      <Button disabled={loading} onClick={onLoadMore} variant="outlined">
        {loading ? 'Cargando...' : 'Cargar más'}
      </Button>
    </Stack>
  ) : null;
}
