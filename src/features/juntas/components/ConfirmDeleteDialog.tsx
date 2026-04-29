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
import { useEffect, useState } from 'react';

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
  const [confirmedWarning, setConfirmedWarning] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmedWarning(false);
    }
  }, [open]);

  const handleClose = () => {
    if (loading) {
      return;
    }

    setConfirmedWarning(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!confirmedWarning) {
      setConfirmedWarning(true);
      return;
    }

    onConfirm();
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : handleClose} open={open}>
      <DialogTitle>Eliminar junta permanentemente</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            Esta acción eliminará el tenant completo de forma permanente.
          </Alert>

          <Alert severity={confirmedWarning ? 'error' : 'info'}>
            {confirmedWarning
              ? 'Última confirmación: se eliminarán sus datos y no podrás recuperarlos desde esta pantalla.'
              : 'Primera advertencia: revisa bien antes de continuar. Esta operación no es un borrado lógico.'}
          </Alert>

          <Typography variant="body2">
            {confirmedWarning
              ? 'Presiona "Eliminar definitivamente" solo si estás completamente seguro.'
              : 'Presiona "Entiendo, continuar" para ver la confirmación final.'}
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
        <Button color="error" disabled={loading} onClick={handleConfirm} variant="contained">
          {loading ? (
            <CircularProgress color="inherit" size={20} />
          ) : confirmedWarning ? (
            'Eliminar definitivamente'
          ) : (
            'Entiendo, continuar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
