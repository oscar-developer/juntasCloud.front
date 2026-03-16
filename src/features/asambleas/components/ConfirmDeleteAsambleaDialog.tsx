import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteAsambleaDialogProps = {
  open: boolean;
  loading: boolean;
  asambleaLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteAsambleaDialog({
  open,
  loading,
  asambleaLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteAsambleaDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar asamblea</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta acción eliminará la asamblea de forma permanente.
        </Typography>
        {asambleaLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {asambleaLabel}
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
