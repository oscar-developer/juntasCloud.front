import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { Persona } from '../types';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

type PersonaResumenSectionProps = {
  persona: Persona;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }} variant="body1">
        {value?.trim() ? value : 'No registrado'}
      </Typography>
    </Box>
  );
}

export function PersonaResumenSection({ persona }: PersonaResumenSectionProps) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.25}>
          <Box>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, lineHeight: 1.12 }}>
              {getFullName(persona)}
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }} useFlexGap>
              <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
              <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailRow label="Nro padrón" value={persona.nroPadron ? String(persona.nroPadron) : null} />
            <DetailRow label="DNI" value={persona.dni} />
            <DetailRow label="Email" value={persona.email} />
            <DetailRow label="Teléfono" value={persona.telefono} />
            <DetailRow label="Dirección" value={persona.direccion} />
            <DetailRow label="Referencia de vivienda" value={persona.referenciaVivienda} />
            <DetailRow label="Fecha de registro" value={persona.fechaRegistro?.slice(0, 10)} />
            <DetailRow label="Fecha de baja" value={persona.fechaBaja?.slice(0, 10)} />
            <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
              <DetailRow label="Observaciones" value={persona.observaciones} />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
