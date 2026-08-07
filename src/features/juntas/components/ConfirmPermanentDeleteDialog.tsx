import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

type ConfirmPermanentDeleteDialogProps = {
  open: boolean;
  tenantName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmPermanentDeleteDialog({
  open,
  tenantName,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmPermanentDeleteDialogProps) {
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : handleClose} open={open}>
      <DialogTitle>Eliminar junta permanentemente</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="error">
            Esta acción no se puede deshacer y la información asociada podría eliminarse
            definitivamente.
          </Alert>
          <Typography variant="body2">
            ¿Deseas eliminar permanentemente
            {tenantName ? ` "${tenantName}"` : ' esta junta'}?
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={handleClose} variant="text">
          Cancelar
        </Button>
        <Button color="error" disabled={loading} onClick={onConfirm} variant="contained">
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Eliminar permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
