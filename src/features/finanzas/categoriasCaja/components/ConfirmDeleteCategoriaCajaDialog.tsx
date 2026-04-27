import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ConfirmDeleteCategoriaCajaDialogProps = {
  open: boolean;
  loading: boolean;
  categoriaLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteCategoriaCajaDialog({
  open,
  loading,
  categoriaLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteCategoriaCajaDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Eliminar categoría de caja</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Esta acción eliminará la categoría de caja.</Typography>
        {categoriaLabel && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            {categoriaLabel}
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
