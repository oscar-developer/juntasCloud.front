import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { Persona } from '../../personas/types';
import type { FaenaParticipacionEstado, FaenaParticipacion } from '../types';
import { FaenaParticipacionActions } from './FaenaParticipacionActions';
import type { AnuladoFilterValue } from './FaenaParticipacionFiltersCard';
import {
  formatFaenaParticipacionTime,
  getAnuladoChipProps,
  getFaenaParticipacionEstadoChipProps,
  getFaenaParticipacionMultaLabel,
  getPersonaLabelById,
} from './faenaParticipacionUi';

type ActiveFilters = {
  estado: FaenaParticipacionEstado | 'TODOS';
  anulado: AnuladoFilterValue;
};

type FaenaParticipacionMobileListProps = {
  rows: FaenaParticipacion[];
  total: number;
  personas: Persona[] | Record<string, Persona>;
  activeFilters: ActiveFilters;
  onView: (participacion: FaenaParticipacion) => void;
  onEdit: (participacion: FaenaParticipacion) => void;
  onAnnul: (participacion: FaenaParticipacion) => void;
};

export function FaenaParticipacionMobileList({
  rows,
  total,
  personas,
  activeFilters,
  onView,
  onEdit,
  onAnnul,
}: FaenaParticipacionMobileListProps) {
  const hasExtraFilters = activeFilters.estado !== 'TODOS' || activeFilters.anulado !== 'NO';

  return (
    <Stack spacing={1.5}>
      <Box sx={{ px: 0.5 }}>
        <Typography sx={{ fontWeight: 700 }} variant="body2">
          {total} participación{total === 1 ? '' : 'es'}
        </Typography>
        {hasExtraFilters ? (
          <Typography color="text.secondary" variant="caption">
            Filtros activos aplicados
          </Typography>
        ) : null}
      </Box>

      {rows.map((participacion) => (
        <Card key={participacion.idFaenaParticipacion} elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1.25}>
              <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                    {getPersonaLabelById(personas, participacion.idPersona)}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                    {participacion.observaciones?.trim() || 'Sin observaciones'}
                  </Typography>
                </Box>
                <FaenaParticipacionActions
                  onAnnul={onAnnul}
                  onEdit={onEdit}
                  onView={onView}
                  participacion={participacion}
                />
              </Stack>

              <Typography color="text.secondary" variant="body2">
                Hora llegada: {formatFaenaParticipacionTime(participacion.horaLlegada)}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                <Chip size="small" variant="outlined" {...getFaenaParticipacionEstadoChipProps(participacion.estado)} />
                <Chip size="small" variant="outlined" {...getAnuladoChipProps(participacion.anulado)} />
              </Stack>

              <Typography variant="body2">Personas extra: {participacion.cantPersonasExtra}</Typography>
              <Typography variant="body2">{getFaenaParticipacionMultaLabel(participacion)}</Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
