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
import { getAsambleaById } from '../services/asambleasApi';
import type { Asamblea } from '../types';
import {
  formatAsambleaDate,
  formatAsambleaDateTime,
  formatAsambleaTime,
  getAsambleaConvocatoriaChipProps,
  getAsambleaErrorMessage,
  getAsambleaEstadoChipProps,
  getAsambleaQuorumLabel,
  getAsambleaTipoChipProps,
} from './asambleasUi';

type AsambleaDetailDialogProps = {
  open: boolean;
  tenantId: string;
  asambleaId?: string | number | null;
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
  tenantId,
  asambleaId,
  onClose,
}: AsambleaDetailDialogProps) {
  const [asamblea, setAsamblea] = useState<Asamblea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAsamblea(null);
      setError(null);
      return;
    }

    if (!asambleaId) {
      setError('No se pudo identificar la asamblea solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadAsamblea = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAsambleaById(tenantId, asambleaId, controller.signal);

        if (!controller.signal.aborted) {
          setAsamblea(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getAsambleaErrorMessage(loadError, 'No se pudo cargar el detalle de la asamblea.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadAsamblea();

    return () => {
      controller.abort();
    };
  }, [asambleaId, open, tenantId]);

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
