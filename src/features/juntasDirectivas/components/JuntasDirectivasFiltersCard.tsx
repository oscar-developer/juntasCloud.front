import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { JuntasDirectivasListQuery } from '../types';

type JuntasDirectivasFiltersCardProps = {
  estadoValue: JuntasDirectivasListQuery['estado'];
  fromValue: string;
  toValue: string;
  onEstadoChange: (value: JuntasDirectivasListQuery['estado']) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
};

export function JuntasDirectivasFiltersCard({
  estadoValue,
  fromValue,
  toValue,
  onEstadoChange,
  onFromChange,
  onToChange,
  onClear,
}: JuntasDirectivasFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="caption">
            Filtra por estado y rango de fechas usando los parametros reales del endpoint.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Estado"
              onChange={(event) => onEstadoChange(event.target.value as JuntasDirectivasListQuery['estado'])}
              select
              sx={{ minWidth: { md: 210 } }}
              value={estadoValue}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="VIGENTE">VIGENTE</MenuItem>
              <MenuItem value="CESADA">CESADA</MenuItem>
              <MenuItem value="ANULADA">ANULADA</MenuItem>
              <MenuItem value="PROYECTADA">PROYECTADA</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Desde"
              onChange={(event) => onFromChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              type="date"
              value={fromValue}
            />
            <TextField
              fullWidth
              label="Hasta"
              onChange={(event) => onToChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              type="date"
              value={toValue}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button onClick={onClear} variant="text">
                Limpiar
              </Button>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
