import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { Faena, FaenaEstado, FaenaTipo } from '../types';
import { FaenaActions } from './FaenaActions';
import {
  formatFaenaDate,
  getFaenaEstadoChipProps,
  getFaenaMultaLabel,
  getFaenaScheduleLabel,
  getFaenaTipoChipProps,
} from './faenasUi';

type ActiveFilters = {
  tipoFaena: FaenaTipo | 'TODOS';
  estado: FaenaEstado | 'TODOS';
  search: string;
};

type FaenaMobileListProps = {
  rows: Faena[];
  total: number;
  activeFilters: ActiveFilters;
  onView: (faena: Faena) => void;
  onEdit: (faena: Faena) => void;
  onDelete: (faena: Faena) => void;
  attendanceBasePath?: string;
};

export function FaenaMobileList({
  rows,
  total,
  activeFilters,
  onView,
  onEdit,
  onDelete,
  attendanceBasePath,
}: FaenaMobileListProps) {
  const hasExtraFilters =
    activeFilters.tipoFaena !== 'TODOS' ||
    activeFilters.estado !== 'TODOS' ||
    Boolean(activeFilters.search.trim());

  return (
    <Stack spacing={1.5}>
      <Box sx={{ px: 0.5 }}>
        <Typography sx={{ fontWeight: 700 }} variant="body2">
          {total} faena{total === 1 ? '' : 's'}
        </Typography>
        {hasExtraFilters ? (
          <Typography color="text.secondary" variant="caption">
            Filtros activos aplicados
          </Typography>
        ) : null}
      </Box>

      {rows.map((faena) => (
        <Card key={faena.idFaena} elevation={0}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1.25}>
              <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                    {faena.descripcion || 'Faena sin descripción'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                    {faena.lugar?.trim() || 'Lugar no registrado'}
                  </Typography>
                </Box>
                <FaenaActions
                  attendanceTo={attendanceBasePath ? `${attendanceBasePath}?idFaena=${faena.idFaena}` : undefined}
                  faena={faena}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                />
              </Stack>

              <Typography color="text.secondary" variant="body2">
                {formatFaenaDate(faena.fechaProgramada)} · {getFaenaScheduleLabel(faena)}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                <Chip size="small" variant="outlined" {...getFaenaTipoChipProps(faena.tipoFaena)} />
                <Chip size="small" variant="outlined" {...getFaenaEstadoChipProps(faena.estado)} />
              </Stack>

              <Typography variant="body2">{getFaenaMultaLabel(faena.montoMultaBase)}</Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}