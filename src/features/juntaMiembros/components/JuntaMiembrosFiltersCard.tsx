import {
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import { getJuntaLabel } from './juntaMiembrosUi';

type JuntaMiembrosFiltersCardProps = {
  juntas: JuntaDirectiva[];
  selectedJuntaId: string;
  onJuntaChange: (value: string) => void;
};

export function JuntaMiembrosFiltersCard({
  juntas,
  selectedJuntaId,
  onJuntaChange,
}: JuntaMiembrosFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="caption">
            Selecciona la junta directiva para ver sus miembros registrados.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Junta directiva"
              onChange={(event) => onJuntaChange(event.target.value)}
              required
              select
              sx={{ minWidth: { md: 240 } }}
              value={selectedJuntaId}
            >
              {juntas.map((junta) => (
                <MenuItem key={junta.idJunta} value={String(junta.idJunta)}>
                  {getJuntaLabel(junta)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
