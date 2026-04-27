import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { CajaCategoriaListQuery } from '../types';

type CategoriaCajaFiltersCardProps = {
  isDesktop: boolean;
  searchValue: string;
  tipoValue: CajaCategoriaListQuery['tipo'];
  activoValue: CajaCategoriaListQuery['activo'];
  onSearchChange: (value: string) => void;
  onTipoChange: (value: CajaCategoriaListQuery['tipo']) => void;
  onActivoChange: (value: CajaCategoriaListQuery['activo']) => void;
  onClear: () => void;
};

export function CategoriaCajaFiltersCard({
  isDesktop,
  searchValue,
  tipoValue,
  activoValue,
  onSearchChange,
  onTipoChange,
  onActivoChange,
  onClear,
}: CategoriaCajaFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          {isDesktop && (
            <Typography color="text.secondary" variant="caption">
              Busca por nombre y filtra por tipo o estado.
            </Typography>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Buscar"
              onChange={(event) => onSearchChange(event.target.value)}
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
            {isDesktop && (
              <>
                <TextField
                  fullWidth
                  label="Tipo"
                  onChange={(event) => onTipoChange(event.target.value as CajaCategoriaListQuery['tipo'])}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={tipoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="INGRESO">INGRESO</MenuItem>
                  <MenuItem value="GASTO">GASTO</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Estado"
                  onChange={(event) => {
                    const value = event.target.value;
                    onActivoChange(value === 'TODOS' ? 'TODOS' : value === 'true');
                  }}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={activoValue === 'TODOS' ? 'TODOS' : String(activoValue)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </TextField>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button onClick={onClear} variant="text">
                    Limpiar
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
