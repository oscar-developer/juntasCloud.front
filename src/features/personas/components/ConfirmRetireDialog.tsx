import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmRetireDialogProps = {
  open: boolean;
  loading: boolean;
  personaName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmRetireDialog({
  open,
  loading,
  personaName,
  onClose,
  onConfirm,
}: ConfirmRetireDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Retirar persona</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta acción hará un retiro lógico y dejará a la persona en estado RETIRADO.
        </Typography>
        {personaName && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {personaName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button color="error" disabled={loading} onClick={onConfirm} variant="contained">
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Retirar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
