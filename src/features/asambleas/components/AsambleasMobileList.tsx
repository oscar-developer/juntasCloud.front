import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { Asamblea, AsambleaConvocatoria, AsambleaEstado, AsambleaTipo } from '../types';
import { AsambleaActions } from './AsambleaActions';
import {
  formatAsambleaDate,
  getAsambleaConvocatoriaChipProps,
  getAsambleaEstadoChipProps,
  getAsambleaQuorumLabel,
  getAsambleaRealScheduleLabel,
  getAsambleaTipoChipProps,
} from './asambleasUi';

type ActiveFilters = {
  tipo: AsambleaTipo | 'TODOS';
  convocatoria: AsambleaConvocatoria | 'TODOS';
  estado: AsambleaEstado | 'TODOS';
};

type AsambleasMobileListProps = {
  rows: Asamblea[];
  total: number;
  activeFilters: ActiveFilters;
  onView: (asamblea: Asamblea) => void;
  onEdit: (asamblea: Asamblea) => void;
  onDelete: (asamblea: Asamblea) => void;
  attendanceBasePath?: string;
};

export function AsambleasMobileList({
  rows,
  total,
  activeFilters,
  onView,
  onEdit,
  onDelete,
  attendanceBasePath,
}: AsambleasMobileListProps) {
  const hasExtraFilters =
    activeFilters.tipo !== 'TODOS' ||
    activeFilters.convocatoria !== 'TODOS' ||
    activeFilters.estado !== 'TODOS';

  return (
    <Stack spacing={1.5}>
      <Box sx={{ px: 0.5 }}>
        <Typography sx={{ fontWeight: 700 }} variant="body2">
          {total} asamblea{total === 1 ? '' : 's'}
        </Typography>
        {hasExtraFilters ? (
          <Typography color="text.secondary" variant="caption">
            Filtros activos aplicados
          </Typography>
        ) : null}
      </Box>

      {rows.map((asamblea) => (
        <Card key={asamblea.idAsamblea} elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1.25}>
              <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                    {asamblea.temaPrincipal || 'Asamblea sin tema'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                    {asamblea.lugar?.trim() || 'Lugar no registrado'}
                  </Typography>
                </Box>
                <AsambleaActions
                  asamblea={asamblea}
                  attendanceTo={
                    attendanceBasePath ? `${attendanceBasePath}?idAsamblea=${asamblea.idAsamblea}` : undefined
                  }
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                />
              </Stack>

              <Typography color="text.secondary" variant="body2">
                {formatAsambleaDate(asamblea.fechaProgramada)} · {getAsambleaRealScheduleLabel(asamblea)}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                <Chip size="small" variant="outlined" {...getAsambleaTipoChipProps(asamblea.tipo)} />
                <Chip size="small" variant="outlined" {...getAsambleaConvocatoriaChipProps(asamblea.convocatoria)} />
                <Chip size="small" variant="outlined" {...getAsambleaEstadoChipProps(asamblea.estado)} />
              </Stack>

              <Typography variant="body2">{getAsambleaQuorumLabel(asamblea)}</Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
