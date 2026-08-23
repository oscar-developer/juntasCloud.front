import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { PersonaFichaResumen } from '../types';
import { getEstadoChipProps } from './personaUi';

type PersonaFichaHeaderProps = {
  resumen: PersonaFichaResumen | null;
  onBack: () => void;
};

export function PersonaFichaHeader({ resumen, onBack }: PersonaFichaHeaderProps) {
  const persona = resumen?.persona;

  return (
    <Stack spacing={1.25}>
      <Box>
        <Button onClick={onBack} startIcon={<ArrowBackRoundedIcon />} variant="text">
          Volver a personas
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            alignItems={{ xs: 'flex-start', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>
                Ficha de persona
              </Typography>
              <Typography sx={{ fontSize: { xs: 25, sm: 32 }, fontWeight: 900, lineHeight: 1.05, mt: 0.5 }}>
                {persona?.nombreCompleto || 'Persona'}
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1.25 }} useFlexGap>
                {persona?.nroPadron ? (
                  <Chip color="primary" label={`Padrón #${persona.nroPadron}`} size="small" variant="outlined" />
                ) : null}
                {persona?.estado ? (
                  <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado as never)} />
                ) : null}
              </Stack>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(3, minmax(110px, 1fr))' },
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <HeaderMetric label="DNI" value={persona?.dni ?? 'No registrado'} />
              <HeaderMetric label="Teléfono" value={persona?.telefono ?? 'No registrado'} />
              <HeaderMetric label="ID" value={persona ? String(persona.idPersona) : '-'} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" sx={{ fontSize: 11, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }} title={value}>
        {value}
      </Typography>
    </Box>
  );
}
