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
import type { FaenaEstado, FaenaTipo } from '../types';

type MobileFiltersState = {
  from: string;
  to: string;
  search: string;
  tipoFaena: FaenaTipo | 'TODOS';
  estado: FaenaEstado | 'TODOS';
};

type FaenaMobileFiltersDialogProps = {
  open: boolean;
  filters: MobileFiltersState;
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

export function FaenaMobileFiltersDialog({
  open,
  filters,
  onChange,
  onClose,
  onClear,
  onApply,
}: FaenaMobileFiltersDialogProps) {
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
          <TextField
            fullWidth
            label="Desde"
            onChange={(event) => onChange({ from: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            type="date"
            value={filters.from}
          />
          <TextField
            fullWidth
            label="Hasta"
            onChange={(event) => onChange({ to: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            type="date"
            value={filters.to}
          />
          <TextField
            fullWidth
            label="Búsqueda"
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Buscar faena..."
            value={filters.search}
          />
          <TextField
            fullWidth
            label="Tipo"
            onChange={(event) => onChange({ tipoFaena: event.target.value as FaenaTipo | 'TODOS' })}
            select
            value={filters.tipoFaena}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="ORDINARIA">ORDINARIA</MenuItem>
            <MenuItem value="EXTRAORDINARIA">EXTRAORDINARIA</MenuItem>
            <MenuItem value="RECUPERACION">RECUPERACION</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Estado"
            onChange={(event) => onChange({ estado: event.target.value as FaenaEstado | 'TODOS' })}
            select
            value={filters.estado}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
            <MenuItem value="EJECUTADA">EJECUTADA</MenuItem>
            <MenuItem value="CANCELADA">CANCELADA</MenuItem>
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
