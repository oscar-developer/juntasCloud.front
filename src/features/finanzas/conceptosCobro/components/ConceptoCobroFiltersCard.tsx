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
import type { ConceptoCobroListQuery, ConceptoCobroTipo } from '../types';
import { CONCEPTO_COBRO_TIPO_LABELS } from './conceptosCobroUi';

type ConceptoCobroFiltersCardProps = {
  isDesktop: boolean;
  searchValue: string;
  tipoValue: ConceptoCobroListQuery['tipo'];
  activoValue: ConceptoCobroListQuery['activo'];
  requierePeriodoValue: ConceptoCobroListQuery['requierePeriodo'];
  onSearchChange: (value: string) => void;
  onTipoChange: (value: ConceptoCobroListQuery['tipo']) => void;
  onActivoChange: (value: ConceptoCobroListQuery['activo']) => void;
  onRequierePeriodoChange: (value: ConceptoCobroListQuery['requierePeriodo']) => void;
  onClear: () => void;
};

const conceptoTipos: ConceptoCobroTipo[] = [
  'CUOTA_ORDINARIA',
  'CUOTA_EXTRAORDINARIA',
  'MULTA_FAENA',
  'MULTA_ASAMBLEA',
  'APORTE',
  'OTRO',
];

function parseBooleanFilter(value: string) {
  return value === 'TODOS' ? 'TODOS' : value === 'true';
}

export function ConceptoCobroFiltersCard({
  isDesktop,
  searchValue,
  tipoValue,
  activoValue,
  requierePeriodoValue,
  onSearchChange,
  onTipoChange,
  onActivoChange,
  onRequierePeriodoChange,
  onClear,
}: ConceptoCobroFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1.5}>
          {isDesktop && (
            <Typography color="text.secondary" variant="caption">
              Busca por nombre y filtra por tipo, estado o requerimiento de periodo.
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
                  onChange={(event) => onTipoChange(event.target.value as ConceptoCobroListQuery['tipo'])}
                  select
                  sx={{ minWidth: { md: 230 } }}
                  value={tipoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  {conceptoTipos.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {CONCEPTO_COBRO_TIPO_LABELS[tipo]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Estado"
                  onChange={(event) => onActivoChange(parseBooleanFilter(event.target.value))}
                  select
                  sx={{ minWidth: { md: 160 } }}
                  value={activoValue === 'TODOS' ? 'TODOS' : String(activoValue)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Periodo"
                  onChange={(event) => onRequierePeriodoChange(parseBooleanFilter(event.target.value))}
                  select
                  sx={{ minWidth: { md: 190 } }}
                  value={requierePeriodoValue === 'TODOS' ? 'TODOS' : String(requierePeriodoValue)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="true">Requiere periodo</MenuItem>
                  <MenuItem value="false">Sin periodo</MenuItem>
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
