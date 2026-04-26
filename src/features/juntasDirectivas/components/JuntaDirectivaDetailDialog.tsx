import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { JuntaDirectiva } from '../types';
import {
  formatJuntaDate,
  getEstadoChipProps,
  getPeriodoLabel,
} from './juntasDirectivasUi';

type JuntaDirectivaDetailDialogProps = {
  open: boolean;
  junta?: JuntaDirectiva | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5 }} variant="body1">
        {value?.trim() ? value : 'No registrado'}
      </Typography>
    </Box>
  );
}

export function JuntaDirectivaDetailDialog({
  open,
  junta,
  loading,
  error,
  onClose,
}: JuntaDirectivaDetailDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de junta directiva</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography color="text.secondary">Cargando...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : junta ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {junta.nombre || 'Junta directiva sin nombre'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getEstadoChipProps(junta.estado)} />
              </Stack>
            </Box>
            <DetailRow label="Fecha de elección" value={formatJuntaDate(junta.fechaEleccion)} />
            <DetailRow label="Periodo" value={getPeriodoLabel(junta)} />
            <DetailRow label="Fecha de inicio" value={formatJuntaDate(junta.fechaInicio)} />
            <DetailRow label="Fecha de fin" value={formatJuntaDate(junta.fechaFin)} />
            <DetailRow label="Documento sustento" value={junta.documentoSustento} />
            <DetailRow label="Observaciones" value={junta.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la junta directiva solicitada.</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
