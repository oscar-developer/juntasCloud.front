import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { PersonaResumenSection } from './PersonaResumenSection';
import type { Persona, PersonaFichaSectionState } from '../types';

type PersonaFichaInfoCompletaDialogProps = {
  open: boolean;
  state: PersonaFichaSectionState<Persona>;
  onClose: () => void;
};

export function PersonaFichaInfoCompletaDialog({
  open,
  state,
  onClose,
}: PersonaFichaInfoCompletaDialogProps) {
  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>Información completa</DialogTitle>
      <DialogContent>
        {state.status === 'loading' ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : state.status === 'error' ? (
          <Alert severity="error">{state.error}</Alert>
        ) : state.data ? (
          <PersonaResumenSection persona={state.data} />
        ) : (
          <Alert severity="info">No se encontró información completa para esta persona.</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
