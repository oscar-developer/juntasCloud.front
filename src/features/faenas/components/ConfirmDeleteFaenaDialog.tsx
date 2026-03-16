import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteFaenaDialogProps = {
  open: boolean;
  loading: boolean;
  faenaLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteFaenaDialog({
  open,
  loading,
  faenaLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteFaenaDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar faena</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta acción eliminará la faena de forma permanente.
        </Typography>
        {faenaLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {faenaLabel}
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
