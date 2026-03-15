import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { JuntaMiembro } from '../types';
import { JuntaMiembroActions } from './JuntaMiembroActions';
import {
  getCargoChipProps,
  getJuntaMiembroPeriodoLabel,
} from './juntaMiembrosUi';

type JuntaMiembrosMobileListProps = {
  rows: JuntaMiembro[];
  getPersonaLabel: (idPersona: string | number) => string;
  onView: (juntaMiembro: JuntaMiembro) => void;
  onEdit: (juntaMiembro: JuntaMiembro) => void;
  onDelete: (juntaMiembro: JuntaMiembro) => void;
};

export function JuntaMiembrosMobileList({
  rows,
  getPersonaLabel,
  onView,
  onEdit,
  onDelete,
}: JuntaMiembrosMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((juntaMiembro, index) => (
        <Card elevation={0} key={juntaMiembro.idJuntaMiembro}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack spacing={1}>
                  <Typography
                    noWrap
                    sx={{ fontSize: 18, fontWeight: 800 }}
                    title={getPersonaLabel(juntaMiembro.idPersona)}
                  >
                    #{index + 1} {getPersonaLabel(juntaMiembro.idPersona)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Periodo: {getJuntaMiembroPeriodoLabel(juntaMiembro)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {juntaMiembro.observaciones?.trim() || 'Sin observaciones'}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                    <Chip size="small" variant="outlined" {...getCargoChipProps(juntaMiembro.cargo)} />
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                <JuntaMiembroActions
                  juntaMiembro={juntaMiembro}
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
