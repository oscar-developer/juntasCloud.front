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
import type { Bien } from '../types';
import { formatBienNumber, getEstadoChipProps } from './bienesUi';

type BienDetailDialogProps = {
  open: boolean;
  bien?: Bien | null;
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

export function BienDetailDialog({
  open,
  bien,
  loading,
  error,
  onClose,
}: BienDetailDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de bien</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : bien ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {bien.descripcion || 'Bien sin descripcion'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getEstadoChipProps(bien.estado)} />
              </Stack>
            </Box>
            <DetailRow label="Tipo" value={bien.tipo} />
            <DetailRow label="Ubicación" value={bien.ubicacion} />
            <DetailRow label="Cantidad" value={formatBienNumber(bien.cantidad)} />
            <DetailRow label="Valor estimado" value={formatBienNumber(bien.valorEstimado)} />
            <DetailRow label="Fecha de alta" value={bien.fechaAlta?.slice(0, 10)} />
            <DetailRow label="Fecha de baja" value={bien.fechaBaja?.slice(0, 10)} />
            <DetailRow label="Observaciones" value={bien.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró el bien solicitado.</Alert>
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
