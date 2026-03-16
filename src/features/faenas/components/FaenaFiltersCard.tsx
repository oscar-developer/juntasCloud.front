import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { FaenaEstado, FaenaTipo } from '../types';

type FaenaFiltersCardProps = {
  isDesktop: boolean;
  fromValue: string;
  toValue: string;
  searchValue: string;
  tipoFaenaValue: FaenaTipo | 'TODOS';
  estadoValue: FaenaEstado | 'TODOS';
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onTipoFaenaChange: (value: FaenaTipo | 'TODOS') => void;
  onEstadoChange: (value: FaenaEstado | 'TODOS') => void;
  onClear: () => void;
  onOpenMobileFilters: () => void;
};

export function FaenaFiltersCard({
  isDesktop,
  fromValue,
  toValue,
  searchValue,
  tipoFaenaValue,
  estadoValue,
  onFromChange,
  onToChange,
  onSearchChange,
  onTipoFaenaChange,
  onEstadoChange,
  onClear,
  onOpenMobileFilters,
}: FaenaFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {isDesktop ? (
            <Typography color="text.secondary" variant="caption">
              Filtra por rango de fechas, búsqueda libre, tipo de faena y estado.
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
                  label="Búsqueda"
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar faena..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  value={searchValue}
                />
                <TextField
                  fullWidth
                  label="Tipo"
                  onChange={(event) => onTipoFaenaChange(event.target.value as FaenaTipo | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={tipoFaenaValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ORDINARIA">ORDINARIA</MenuItem>
                  <MenuItem value="EXTRAORDINARIA">EXTRAORDINARIA</MenuItem>
                  <MenuItem value="RECUPERACION">RECUPERACION</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Estado"
                  onChange={(event) => onEstadoChange(event.target.value as FaenaEstado | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={estadoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
                  <MenuItem value="EJECUTADA">EJECUTADA</MenuItem>
                  <MenuItem value="CANCELADA">CANCELADA</MenuItem>
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
