import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
  type SlideProps,
} from '@mui/material';
import { forwardRef, type Ref } from 'react';
import type { Persona } from '../../personas/types';
import type { FaenaParticipacionEstado } from '../types';
import { FaenaParticipacionPersonaAutocomplete } from './FaenaParticipacionPersonaAutocomplete';
import type { AnuladoFilterValue } from './FaenaParticipacionFiltersCard';

type MobileFiltersState = {
  selectedPersona: Persona | null;
  estado: FaenaParticipacionEstado | 'TODOS';
  anulado: AnuladoFilterValue;
};

type FaenaParticipacionMobileFiltersDialogProps = {
  open: boolean;
  tenantId: string;
  disabled?: boolean;
  filters: MobileFiltersState;
  initialPersonaOptions?: Persona[];
  onChange: (nextPartial: Partial<MobileFiltersState>) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
};

const Transition = forwardRef(function Transition(
  props: SlideProps,
  ref: Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export function FaenaParticipacionMobileFiltersDialog({
  open,
  tenantId,
  disabled = false,
  filters,
  initialPersonaOptions = [],
  onChange,
  onClose,
  onClear,
  onApply,
}: FaenaParticipacionMobileFiltersDialogProps) {
  return (
    <Dialog TransitionComponent={Transition} fullScreen onClose={onClose} open={open}>
      <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography sx={{ flex: 1, fontWeight: 700 }} variant="h6">
            Filtros
          </Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: 0, flex: 1, flexDirection: 'column' }}>
        <Stack spacing={2.5} sx={{ flex: 1, px: 2, py: 3 }}>
          <FaenaParticipacionPersonaAutocomplete
            disabled={disabled}
            initialOptions={initialPersonaOptions}
            label="Persona"
            onChange={(persona) => onChange({ selectedPersona: persona })}
            tenantId={tenantId}
            value={filters.selectedPersona}
          />
          <TextField
            fullWidth
            label="Estado"
            onChange={(event) => onChange({ estado: event.target.value as FaenaParticipacionEstado | 'TODOS' })}
            select
            value={filters.estado}
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
            onChange={(event) => onChange({ anulado: event.target.value as AnuladoFilterValue })}
            select
            value={filters.anulado}
          >
            <MenuItem value="NO">Solo activas</MenuItem>
            <MenuItem value="SI">Solo anuladas</MenuItem>
            <MenuItem value="TODOS">Todas</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button fullWidth onClick={onClear} variant="outlined">
            Limpiar
          </Button>
          <Button fullWidth onClick={onApply} variant="contained">
            Aplicar filtros
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
