import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeactivateDialogProps = {
  open: boolean;
  loading: boolean;
  bienLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeactivateDialog({
  open,
  loading,
  bienLabel,
  onClose,
  onConfirm,
}: ConfirmDeactivateDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Dar de baja bien</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta acción marcará el bien con estado DADO_DE_BAJA.
        </Typography>
        {bienLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {bienLabel}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button color="error" disabled={loading} onClick={onConfirm} variant="contained">
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Dar de baja'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
