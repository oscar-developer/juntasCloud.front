import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import type { PersonaFichaSectionState, PersonaTerrenoFicha } from '../types';
import { normalizeFichaLabel } from './personaFichaUi';

type PersonaFichaTerrenosSectionProps = {
  state: PersonaFichaSectionState<PersonaTerrenoFicha[]>;
  onRetry: () => void;
};

export function PersonaFichaTerrenosSection({ state, onRetry }: PersonaFichaTerrenosSectionProps) {
  if (state.status === 'loading' || state.status === 'idle') {
    return <SectionLoading label="Cargando terrenos..." />;
  }

  if (state.status === 'error') {
    return <SectionError message={state.error} onRetry={onRetry} />;
  }

  const items = state.data ?? [];

  if (items.length === 0) {
    return <Alert severity="info">No se encontraron terrenos relacionados a esta persona.</Alert>;
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
      {items.map((item) => {
        const title = item.codigoLote || item.descripcion || `Terreno ${item.idTerreno}`;
        const area = item.areaAproxM2 ?? item.areaLegalM2;

        return (
          <Card key={item.idPersonaTerreno} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{title}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {item.ubicacion ?? 'Ubicación no registrada'}
                  </Typography>
                </Box>
                <Chip color={item.estado === 'ACTIVO' || item.estado === 'EN_USO' ? 'success' : 'default'} label={normalizeFichaLabel(item.estado)} size="small" variant="outlined" />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
                  mt: 2,
                }}
              >
                <Detail label="Área" value={area !== null ? `${area.toFixed(2)} m²` : 'No registrada'} />
                <Detail label="Manzana" value={item.manzana ?? 'No registrada'} />
                <Detail label="Lote" value={item.numeroLote ?? 'No registrado'} />
                <Detail label="Relación" value={normalizeFichaLabel(item.tipoRelacion)} />
                <Detail
                  label="Participación"
                  value={item.porcentajeParticipacion !== null ? `${item.porcentajeParticipacion}%` : 'No registrada'}
                />
                <Detail label="Partida" value={item.partidaRegistral ?? 'No registrada'} />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography noWrap sx={{ fontWeight: 700 }} title={value} variant="body2">
        {value}
      </Typography>
    </Box>
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
