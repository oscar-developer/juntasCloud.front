import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteJuntaMiembroDialogProps = {
  open: boolean;
  loading: boolean;
  juntaMiembroLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteJuntaMiembroDialog({
  open,
  loading,
  juntaMiembroLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteJuntaMiembroDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar miembro de junta</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta accion eliminara el miembro seleccionado de forma definitiva.
        </Typography>
        {juntaMiembroLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {juntaMiembroLabel}
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
