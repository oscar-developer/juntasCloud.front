import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteJuntaDirectivaDialogProps = {
  open: boolean;
  loading: boolean;
  juntaName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteJuntaDirectivaDialog({
  open,
  loading,
  juntaName,
  onClose,
  onConfirm,
}: ConfirmDeleteJuntaDirectivaDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar junta directiva</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta accion eliminara la junta directiva seleccionada de forma definitiva.
        </Typography>
        {juntaName && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {juntaName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button color="error" disabled={loading} onClick={onConfirm} variant="contained">
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
