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

type ConfirmAnularFaenaParticipacionDialogProps = {
  open: boolean;
  loading: boolean;
  participacionLabel?: string;
  onClose: () => void;
  onConfirm: (motivoAnulacion: string) => void;
};

export function ConfirmAnularFaenaParticipacionDialog({
  open,
  loading,
  participacionLabel,
  onClose,
  onConfirm,
}: ConfirmAnularFaenaParticipacionDialogProps) {
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setMotivoAnulacion('');
      setTouched(false);
    }
  }, [open]);

  const error = touched && !motivoAnulacion.trim() ? 'El motivo de anulación es requerido.' : ' ';

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Anular participación</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            Esta acción marcará la participación como anulada y no podrá registrarse como activa nuevamente desde esta pantalla.
          </Typography>
          {participacionLabel ? (
            <Typography color="text.secondary" variant="body2">
              {participacionLabel}
            </Typography>
          ) : null}
          <TextField
            autoFocus
            error={Boolean(touched && !motivoAnulacion.trim())}
            fullWidth
            helperText={error}
            label="Motivo de anulación"
            minRows={3}
            multiline
            onBlur={() => setTouched(true)}
            onChange={(event) => setMotivoAnulacion(event.target.value)}
            value={motivoAnulacion}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button
          color="error"
          disabled={loading || !motivoAnulacion.trim()}
          onClick={() => onConfirm(motivoAnulacion.trim())}
          variant="contained"
        >
          {loading ? <CircularProgress color="inherit" size={20} /> : 'Anular'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
