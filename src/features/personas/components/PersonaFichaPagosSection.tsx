import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import type { PersonaFichaPaginatedResponse, PersonaFichaSectionState, PersonaPagoFicha } from '../types';
import { formatFichaDate, formatFichaMoney, getPagoStatusChipProps, normalizeFichaLabel } from './personaFichaUi';

type PersonaFichaPagosSectionProps = {
  state: PersonaFichaSectionState<PersonaFichaPaginatedResponse<PersonaPagoFicha>>;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
};

export function PersonaFichaPagosSection({ state, canLoadMore, onLoadMore, onRetry }: PersonaFichaPagosSectionProps) {
  const items = state.data?.items ?? [];
  const totalPagado = items.reduce((total, item) => total + item.importe, 0);
  const ultimoPago = items[0]?.fecha;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
        <Metric label="Total pagado cargado" tone="success" value={formatFichaMoney(totalPagado)} />
        <Metric label="Pagos" value={String(state.data?.total ?? 0)} />
        <Metric label="Último pago" value={ultimoPago ? formatFichaDate(ultimoPago) : 'Sin pagos'} />
      </Box>

      {state.status === 'loading' && !state.data ? (
        <SectionLoading label="Cargando pagos..." />
      ) : state.status === 'error' ? (
        <SectionError message={state.error} onRetry={onRetry} />
      ) : items.length > 0 ? (
        <>
          <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
            {items.map((item) => (
              <Card key={item.idObligacionPago} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography color="text.secondary" variant="caption">
                        {formatFichaDate(item.fecha)} · {normalizeFichaLabel(item.medioPago)}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{item.concepto}</Typography>
                      {item.referencia ? (
                        <Typography color="text.secondary" variant="caption">Ref: {item.referencia}</Typography>
                      ) : null}
                      {item.descripcion ? (
                        <Typography color="text.secondary" variant="caption">{item.descripcion}</Typography>
                      ) : null}
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Typography color="success.main" sx={{ fontWeight: 900 }}>
                        {formatFichaMoney(item.importe)}
                      </Typography>
                      <Chip size="small" {...getPagoStatusChipProps(item.estado)} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
          <LoadMoreButton canLoadMore={canLoadMore} loading={state.status === 'loading'} onLoadMore={onLoadMore} />
        </>
      ) : (
        <Alert severity="info">No se encontraron pagos para esta persona.</Alert>
      )}
    </Stack>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography color="text.secondary" variant="caption">{label}</Typography>
        <Typography sx={{ color: tone === 'success' ? 'success.main' : 'text.primary', fontSize: 24, fontWeight: 900 }}>
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
