import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { Asamblea } from '../types';
import {
  formatAsambleaDate,
  formatAsambleaDateTime,
  formatAsambleaTime,
  getAsambleaConvocatoriaChipProps,
  getAsambleaEstadoChipProps,
  getAsambleaQuorumLabel,
  getAsambleaTipoChipProps,
} from './asambleasUi';

type AsambleaDetailDialogProps = {
  open: boolean;
  asamblea?: Asamblea | null;
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

export function AsambleaDetailDialog({
  open,
  asamblea,
  loading,
  error,
  onClose,
}: AsambleaDetailDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de asamblea</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : asamblea ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {asamblea.temaPrincipal || 'Asamblea sin tema'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getAsambleaTipoChipProps(asamblea.tipo)} />
                <Chip size="small" variant="outlined" {...getAsambleaConvocatoriaChipProps(asamblea.convocatoria)} />
                <Chip size="small" variant="outlined" {...getAsambleaEstadoChipProps(asamblea.estado)} />
              </Stack>
            </Box>
            <DetailRow label="Lugar" value={asamblea.lugar} />
            <DetailRow label="Fecha programada" value={formatAsambleaDate(asamblea.fechaProgramada)} />
            <DetailRow label="Hora inicio real" value={formatAsambleaTime(asamblea.horaInicioReal)} />
            <DetailRow label="Hora fin real" value={formatAsambleaTime(asamblea.horaFinReal)} />
            <DetailRow label="Quórum" value={getAsambleaQuorumLabel(asamblea)} />
            <DetailRow label="Número de acta" value={asamblea.numeroActa} />
            <DetailRow label="Observaciones" value={asamblea.observaciones} />
            <DetailRow label="Cerrada en" value={formatAsambleaDateTime(asamblea.cerradaAt)} />
            <DetailRow
              label="Cerrada por usuario"
              value={asamblea.cerradaByUser === null || asamblea.cerradaByUser === undefined ? null : String(asamblea.cerradaByUser)}
            />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la asamblea solicitada.</Alert>
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
