import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteConceptoCobroDialogProps = {
  open: boolean;
  loading: boolean;
  conceptoLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteConceptoCobroDialog({
  open,
  loading,
  conceptoLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteConceptoCobroDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar concepto de cobro</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Esta acción eliminará el concepto de cobro.</Typography>
        {conceptoLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {conceptoLabel}
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
