import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteTenantProfileDialogProps = {
  open: boolean;
  loading: boolean;
  profileName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteTenantProfileDialog({
  open,
  loading,
  profileName,
  onClose,
  onConfirm,
}: ConfirmDeleteTenantProfileDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar perfil</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Esta acción eliminará el perfil si no está asignado a usuarios del tenant.
        </Typography>
        {profileName && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {profileName}
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
