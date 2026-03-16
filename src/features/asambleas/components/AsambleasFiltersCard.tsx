import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { AsambleaConvocatoria, AsambleaEstado, AsambleaTipo } from '../types';

type AsambleasFiltersCardProps = {
  isDesktop: boolean;
  fromValue: string;
  toValue: string;
  tipoValue: AsambleaTipo | 'TODOS';
  convocatoriaValue: AsambleaConvocatoria | 'TODOS';
  estadoValue: AsambleaEstado | 'TODOS';
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onTipoChange: (value: AsambleaTipo | 'TODOS') => void;
  onConvocatoriaChange: (value: AsambleaConvocatoria | 'TODOS') => void;
  onEstadoChange: (value: AsambleaEstado | 'TODOS') => void;
  onClear: () => void;
  onOpenMobileFilters: () => void;
};

export function AsambleasFiltersCard({
  isDesktop,
  fromValue,
  toValue,
  tipoValue,
  convocatoriaValue,
  estadoValue,
  onFromChange,
  onToChange,
  onTipoChange,
  onConvocatoriaChange,
  onEstadoChange,
  onClear,
  onOpenMobileFilters,
}: AsambleasFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {isDesktop ? (
            <Typography color="text.secondary" variant="caption">
              Filtra por rango de fechas, tipo de asamblea, convocatoria y estado.
            </Typography>
          ) : null}

          <Stack direction="row" flexWrap={{ xs: 'wrap', md: 'nowrap' }} spacing={1.5} useFlexGap>
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
            {isDesktop ? (
              <>
                <TextField
                  fullWidth
                  label="Tipo"
                  onChange={(event) => onTipoChange(event.target.value as AsambleaTipo | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 180 } }}
                  value={tipoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ORDINARIA">ORDINARIA</MenuItem>
                  <MenuItem value="EXTRAORDINARIA">EXTRAORDINARIA</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Convocatoria"
                  onChange={(event) => onConvocatoriaChange(event.target.value as AsambleaConvocatoria | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={convocatoriaValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PRIMERA">PRIMERA</MenuItem>
                  <MenuItem value="SEGUNDA">SEGUNDA</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Estado"
                  onChange={(event) => onEstadoChange(event.target.value as AsambleaEstado | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={estadoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
                  <MenuItem value="REALIZADA">REALIZADA</MenuItem>
                  <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                  <MenuItem value="CERRADA">CERRADA</MenuItem>
                </TextField>
                <Button onClick={onClear} sx={{ alignSelf: 'center' }} variant="text">
                  Limpiar
                </Button>
              </>
            ) : (
              <Button
                onClick={onOpenMobileFilters}
                startIcon={<FilterListRoundedIcon />}
                sx={{ minWidth: 112 }}
                variant="outlined"
              >
                Filtros
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
