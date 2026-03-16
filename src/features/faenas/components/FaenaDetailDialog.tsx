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
import { getFaenaById } from '../services/faenasApi';
import type { Faena } from '../types';
import {
  formatFaenaDate,
  formatFaenaTime,
  getFaenaErrorMessage,
  getFaenaEstadoChipProps,
  getFaenaMandatoryLabel,
  getFaenaMultaLabel,
  getFaenaTipoChipProps,
} from './faenasUi';

type FaenaDetailDialogProps = {
  open: boolean;
  tenantId: string;
  faenaId?: string | number | null;
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

export function FaenaDetailDialog({
  open,
  tenantId,
  faenaId,
  onClose,
}: FaenaDetailDialogProps) {
  const [faena, setFaena] = useState<Faena | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFaena(null);
      setError(null);
      return;
    }

    if (!faenaId) {
      setError('No se pudo identificar la faena solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadFaena = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getFaenaById(tenantId, faenaId, controller.signal);

        if (!controller.signal.aborted) {
          setFaena(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getFaenaErrorMessage(loadError, 'No se pudo cargar el detalle de la faena.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadFaena();

    return () => {
      controller.abort();
    };
  }, [faenaId, open, tenantId]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de faena</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : faena ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {faena.descripcion || 'Faena sin descripción'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getFaenaTipoChipProps(faena.tipoFaena)} />
                <Chip size="small" variant="outlined" {...getFaenaEstadoChipProps(faena.estado)} />
              </Stack>
            </Box>
            <DetailRow label="Lugar" value={faena.lugar} />
            <DetailRow label="Fecha programada" value={formatFaenaDate(faena.fechaProgramada)} />
            <DetailRow label="Hora inicio" value={formatFaenaTime(faena.horaInicio)} />
            <DetailRow label="Hora fin" value={formatFaenaTime(faena.horaFin)} />
            <DetailRow label="Obligatoria" value={getFaenaMandatoryLabel(faena.esObligatoria)} />
            <DetailRow label="Multa base" value={getFaenaMultaLabel(faena.montoMultaBase)} />
            <DetailRow label="Observaciones" value={faena.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la faena solicitada.</Alert>
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
