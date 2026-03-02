import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteDialogProps = {
  open: boolean;
  tenantName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  open,
  tenantName,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar junta</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          ¿Estás seguro que deseas eliminar esta junta? Esta acción no se puede deshacer.
        </Typography>
        {tenantName && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {tenantName}
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
