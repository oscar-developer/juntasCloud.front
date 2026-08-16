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
import type { AttendanceRowVM } from '../types';
import { formatAttendanceTime } from './asambleaAttendanceUi';

type AsambleaAttendanceLateDialogProps = {
  open: boolean;
  row: AttendanceRowVM | null;
  onClose: () => void;
  onConfirm: (values: { horaLlegada: string; observaciones?: string }) => Promise<void> | void;
};

function getCurrentTimeInputValue(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function normalizeTimeInputValue(value?: string | null) {
  const formatted = formatAttendanceTime(value);
  return formatted === 'Sin hora' ? getCurrentTimeInputValue() : formatted;
}

export function AsambleaAttendanceLateDialog({
  open,
  row,
  onClose,
  onConfirm,
}: AsambleaAttendanceLateDialogProps) {
  const [horaLlegada, setHoraLlegada] = useState(getCurrentTimeInputValue());
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setTouched(false);
      return;
    }

    setHoraLlegada(normalizeTimeInputValue(row?.horaLlegada));
    setObservaciones(row?.observaciones ?? '');
    setTouched(false);
  }, [open, row]);

  const hasTimeError = touched && !horaLlegada;

  const handleSubmit = async () => {
    setTouched(true);

    if (!horaLlegada || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm({
        horaLlegada,
        observaciones: observaciones.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>Registrar tardanza</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography sx={{ fontWeight: 700 }}>{row?.displayPrimaryText ?? 'Persona'}</Typography>
          <TextField
            error={hasTimeError}
            fullWidth
            helperText={hasTimeError ? 'La hora de llegada es requerida.' : ' '}
            label="Hora de llegada"
            onBlur={() => setTouched(true)}
            onChange={(event) => setHoraLlegada(event.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
            type="time"
            value={horaLlegada}
          />
          <TextField
            fullWidth
            label="Observación (opcional)"
            minRows={2}
            multiline
            onChange={(event) => setObservaciones(event.target.value)}
            value={observaciones}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={submitting} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button disabled={submitting || !horaLlegada} onClick={handleSubmit} variant="contained">
          {submitting ? <CircularProgress color="inherit" size={18} /> : 'Registrar tardanza'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
