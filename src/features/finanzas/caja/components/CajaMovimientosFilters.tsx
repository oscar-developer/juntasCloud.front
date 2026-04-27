import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { CajaMovimientosQuery } from '../types';

type CajaMovimientosFiltersProps = {
  fromValue: string;
  toValue: string;
  tipoValue: CajaMovimientosQuery['tipo'];
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onTipoChange: (value: CajaMovimientosQuery['tipo']) => void;
  onClear: () => void;
};

export function CajaMovimientosFilters({
  fromValue,
  toValue,
  tipoValue,
  onFromChange,
  onToChange,
  onTipoChange,
  onClear,
}: CajaMovimientosFiltersProps) {
  return (
    <Card elevation={0}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
          <TextField
            fullWidth
            label="Tipo"
            onChange={(event) => onTipoChange(event.target.value as CajaMovimientosQuery['tipo'])}
            select
            value={tipoValue ?? 'TODOS'}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="INGRESO">Ingreso</MenuItem>
            <MenuItem value="GASTO">Egreso</MenuItem>
          </TextField>
          <Button
            onClick={onClear}
            startIcon={<FilterAltOffRoundedIcon />}
            sx={{ minWidth: { md: 150 } }}
            variant="outlined"
          >
            Limpiar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
