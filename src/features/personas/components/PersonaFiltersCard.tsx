import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Card, CardContent, IconButton, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
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
  onExportClick: () => void;
  exportLoading?: boolean;
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
  onExportClick,
  exportLoading = false,
}: PersonaFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 1, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 1, sm: 2.5, md: 3 } } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack spacing={{ xs: 0.75, sm: 1.5 }}>
              {isDesktop && (
                <Typography color="text.secondary" variant="caption">
                  Busca en nombre, apellidos, DNI, teléfono, tipo, estado y observaciones.
                </Typography>
              )}
              <Stack direction={{ xs: 'row', md: 'row' }} spacing={{ xs: 1, sm: 2 }}>
                <TextField
                  fullWidth
                  label="Buscar"
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar persona..."
                  sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      '& .MuiInputLabel-root': {
                        display: 'none',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        top: 0,
                      },
                      '& legend': {
                        display: 'none',
                      },
                    },
                  })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: (theme) => ({
                        [theme.breakpoints.down('sm')]: {
                          minHeight: 44,
                          '& .MuiInputBase-input': {
                            py: 1.1,
                          },
                        },
                      }),
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
                      <MenuItem value="FALLECIDO">FALLECIDO</MenuItem>
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
          </Box>
          {isDesktop ? (
            <Button
              loading={exportLoading}
              onClick={onExportClick}
              startIcon={<DownloadRoundedIcon />}
              variant="outlined"
            >
              Exportar
            </Button>
          ) : (
            <IconButton
              aria-label="Exportar"
              disabled={exportLoading}
              onClick={onExportClick}
              sx={{ height: { xs: 44, sm: 40 }, width: { xs: 44, sm: 40 } }}
            >
              <DownloadRoundedIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
