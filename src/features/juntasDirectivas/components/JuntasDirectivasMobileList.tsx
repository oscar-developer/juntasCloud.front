import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { JuntaDirectiva } from '../types';
import { JuntaDirectivaActions } from './JuntaDirectivaActions';
import { formatJuntaDate, getEstadoChipProps, getPeriodoLabel } from './juntasDirectivasUi';

type JuntasDirectivasMobileListProps = {
  rows: JuntaDirectiva[];
  onView: (junta: JuntaDirectiva) => void;
  onEdit: (junta: JuntaDirectiva) => void;
  onDelete: (junta: JuntaDirectiva) => void;
};

export function JuntasDirectivasMobileList({
  rows,
  onView,
  onEdit,
  onDelete,
}: JuntasDirectivasMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((junta, index) => (
        <Card elevation={0} key={junta.idJunta}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack spacing={1}>
                  <Typography
                    noWrap
                    sx={{ fontSize: 18, fontWeight: 800 }}
                    title={junta.nombre || 'Junta directiva sin nombre'}
                  >
                    #{index + 1} {junta.nombre || 'Junta directiva sin nombre'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Elección: {formatJuntaDate(junta.fechaEleccion)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Periodo: {getPeriodoLabel(junta)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {junta.documentoSustento?.trim() || 'Sin documento de sustento'}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                    <Chip size="small" variant="outlined" {...getEstadoChipProps(junta.estado)} />
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                <JuntaDirectivaActions
                  junta={junta}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
