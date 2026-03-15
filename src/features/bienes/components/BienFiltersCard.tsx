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
import type { BienListQuery } from '../types';

type BienFiltersCardProps = {
  isDesktop: boolean;
  searchValue: string;
  estadoValue: BienListQuery['estado'];
  tipoValue: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: BienListQuery['estado']) => void;
  onTipoChange: (value: string) => void;
  onClear: () => void;
};

export function BienFiltersCard({
  isDesktop,
  searchValue,
  estadoValue,
  tipoValue,
  onSearchChange,
  onEstadoChange,
  onTipoChange,
  onClear,
}: BienFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          {isDesktop && (
            <Typography color="text.secondary" variant="caption">
              Busca en descripcion, tipo, ubicacion, estado y observaciones.
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
                  label="Estado"
                  onChange={(event) => onEstadoChange(event.target.value as BienListQuery['estado'])}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={estadoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="BUENO">BUENO</MenuItem>
                  <MenuItem value="REGULAR">REGULAR</MenuItem>
                  <MenuItem value="MALO">MALO</MenuItem>
                  <MenuItem value="DADO_DE_BAJA">DADO_DE_BAJA</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Tipo"
                  onChange={(event) => onTipoChange(event.target.value)}
                  sx={{ minWidth: { md: 220 } }}
                  value={tipoValue}
                />
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
