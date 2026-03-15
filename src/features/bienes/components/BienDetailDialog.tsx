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
import { useEffect, useState } from 'react';
import { getBienById } from '../services/bienesApi';
import type { Bien } from '../types';
import { formatBienNumber, getBienErrorMessage, getEstadoChipProps } from './bienesUi';

type BienDetailDialogProps = {
  open: boolean;
  tenantId: string;
  bienId?: string | number | null;
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
  tenantId,
  bienId,
  onClose,
}: BienDetailDialogProps) {
  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBien(null);
      setError(null);
      return;
    }

    if (!bienId) {
      setError('No se pudo identificar el bien solicitado.');
      return;
    }

    const controller = new AbortController();

    const loadBien = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getBienById(tenantId, bienId, controller.signal);

        if (!controller.signal.aborted) {
          setBien(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getBienErrorMessage(loadError, 'No se pudo cargar el detalle del bien.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadBien();

    return () => {
      controller.abort();
    };
  }, [open, bienId, tenantId]);

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
