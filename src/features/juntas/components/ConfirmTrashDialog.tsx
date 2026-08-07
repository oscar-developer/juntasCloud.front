import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

type ConfirmTrashDialogProps = {
  open: boolean;
  tenantName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmTrashDialog({
  open,
  tenantName,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmTrashDialogProps) {
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : handleClose} open={open}>
      <DialogTitle>Enviar junta a la papelera</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            La junta dejará de aparecer entre tus juntas activas.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Posteriormente podrás restaurarla desde la Papelera cuando la restauración esté
            disponible.
          </Typography>
          {tenantName && (
            <Typography color="text.secondary" variant="body2">
              Junta: {tenantName}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={handleClose} variant="text">
          Cancelar
        </Button>
        <Button color="error" disabled={loading} onClick={onConfirm} variant="contained">
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Enviar a papelera'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
