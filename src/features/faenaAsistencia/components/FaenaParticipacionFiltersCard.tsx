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
import type { Faena } from '../../faenas/types';
import type { Persona } from '../../personas/types';
import type { FaenaParticipacionEstado } from '../types';
import { FaenaParticipacionPersonaAutocomplete } from './FaenaParticipacionPersonaAutocomplete';
import { getFaenaLabelById } from './faenaParticipacionUi';

export type AnuladoFilterValue = 'NO' | 'SI' | 'TODOS';

type FaenaParticipacionFiltersCardProps = {
  isDesktop: boolean;
  tenantId: string;
  faenas: Faena[];
  selectedFaenaId: string;
  selectedPersona: Persona | null;
  estadoValue: FaenaParticipacionEstado | 'TODOS';
  anuladoValue: AnuladoFilterValue;
  initialPersonaOptions?: Persona[];
  onFaenaChange: (value: string) => void;
  onPersonaChange: (persona: Persona | null) => void;
  onEstadoChange: (value: FaenaParticipacionEstado | 'TODOS') => void;
  onAnuladoChange: (value: AnuladoFilterValue) => void;
  onClear: () => void;
  onOpenMobileFilters: () => void;
};

export function FaenaParticipacionFiltersCard({
  isDesktop,
  tenantId,
  faenas,
  selectedFaenaId,
  selectedPersona,
  estadoValue,
  anuladoValue,
  initialPersonaOptions = [],
  onFaenaChange,
  onPersonaChange,
  onEstadoChange,
  onAnuladoChange,
  onClear,
  onOpenMobileFilters,
}: FaenaParticipacionFiltersCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {isDesktop ? (
            <Typography color="text.secondary" variant="caption">
              Selecciona una faena y luego filtra por persona, estado o anulación.
            </Typography>
          ) : null}

          <Stack direction="row" flexWrap={{ xs: 'wrap', md: 'nowrap' }} spacing={1.5} useFlexGap>
            <TextField
              fullWidth
              label="Faena"
              onChange={(event) => onFaenaChange(event.target.value)}
              select
              value={selectedFaenaId}
            >
              <MenuItem value="">Selecciona una faena</MenuItem>
              {faenas.map((faena) => (
                <MenuItem key={faena.idFaena} value={String(faena.idFaena)}>
                  {getFaenaLabelById(faenas, faena.idFaena)}
                </MenuItem>
              ))}
            </TextField>
            {isDesktop ? (
              <>
                <FaenaParticipacionPersonaAutocomplete
                  disabled={!selectedFaenaId}
                  initialOptions={initialPersonaOptions}
                  label="Persona"
                  onChange={onPersonaChange}
                  tenantId={tenantId}
                  value={selectedPersona}
                />
                <TextField
                  fullWidth
                  label="Estado"
                  onChange={(event) => onEstadoChange(event.target.value as FaenaParticipacionEstado | 'TODOS')}
                  select
                  sx={{ minWidth: { md: 180 } }}
                  value={estadoValue}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                  <MenuItem value="ASISTIO">ASISTIÓ</MenuItem>
                  <MenuItem value="TARDE">TARDE</MenuItem>
                  <MenuItem value="FALTO">FALTÓ</MenuItem>
                  <MenuItem value="JUSTIFICADO">JUSTIFICADO</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Anulado"
                  onChange={(event) => onAnuladoChange(event.target.value as AnuladoFilterValue)}
                  select
                  sx={{ minWidth: { md: 150 } }}
                  value={anuladoValue}
                >
                  <MenuItem value="NO">Solo activas</MenuItem>
                  <MenuItem value="SI">Solo anuladas</MenuItem>
                  <MenuItem value="TODOS">Todas</MenuItem>
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
