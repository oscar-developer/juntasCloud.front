import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Card, CardContent, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { ListQuery } from '../types';

type PersonaFiltersCardProps = {
  isDesktop: boolean;
  searchValue: string;
  estadoValue: ListQuery['estado'];
  tipoValue: ListQuery['tipoParticipante'];
  dniValue: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: ListQuery['estado']) => void;
  onTipoChange: (value: ListQuery['tipoParticipante']) => void;
  onDniChange: (value: string) => void;
  onClear: () => void;
};

export function PersonaFiltersCard({
  isDesktop,
  searchValue,
  estadoValue,
  tipoValue,
  dniValue,
  onSearchChange,
  onEstadoChange,
  onTipoChange,
  onDniChange,
  onClear,
}: PersonaFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          {isDesktop && (
            <Typography color="text.secondary" variant="caption">
              Busca en nombre, apellidos, DNI, teléfono, tipo, estado y observaciones.
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
                  onChange={(event) => onEstadoChange(event.target.value as ListQuery['estado'])}
                  select
                  sx={{ minWidth: { md: 180 } }}
                  value={estadoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                  <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
                  <MenuItem value="RETIRADO">RETIRADO</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Tipo"
                  onChange={(event) =>
                    onTipoChange(event.target.value as ListQuery['tipoParticipante'])
                  }
                  select
                  sx={{ minWidth: { md: 210 } }}
                  value={tipoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PADRONADO">PADRONADO</MenuItem>
                  <MenuItem value="NO_PADRONADO">NO_PADRONADO</MenuItem>
                  <MenuItem value="INVITADO">INVITADO</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="DNI"
                  onChange={(event) => onDniChange(event.target.value)}
                  value={dniValue}
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
