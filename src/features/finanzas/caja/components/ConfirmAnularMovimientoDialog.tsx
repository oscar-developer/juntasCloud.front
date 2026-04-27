import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

type ConfirmAnularMovimientoDialogProps = {
  open: boolean;
  loading: boolean;
  movimientoLabel?: string;
  onClose: () => void;
  onConfirm: (motivoAnulacion: string) => void;
};

export function ConfirmAnularMovimientoDialog({
  open,
  loading,
  movimientoLabel,
  onClose,
  onConfirm,
}: ConfirmAnularMovimientoDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setMotivo('');
      setTouched(false);
    }
  }, [open]);

  const error = touched && !motivo.trim() ? 'El motivo de anulación es requerido.' : '';

  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Anular movimiento de caja</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            Esta acción marcará el movimiento como anulado sin eliminarlo físicamente.
          </Typography>
          {movimientoLabel && (
            <Typography color="text.secondary" variant="body2">
              {movimientoLabel}
            </Typography>
          )}
          <TextField
            autoFocus
            error={Boolean(error)}
            fullWidth
            helperText={error || ' '}
            label="Motivo de anulación"
            minRows={3}
            multiline
            onBlur={() => setTouched(true)}
            onChange={(event) => setMotivo(event.target.value)}
            required
            value={motivo}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button
          color="error"
          disabled={loading || !motivo.trim()}
          onClick={() => {
            setTouched(true);
            if (motivo.trim()) {
              onConfirm(motivo);
            }
          }}
          variant="contained"
        >
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Anular'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
