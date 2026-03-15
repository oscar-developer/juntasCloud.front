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
import { useEffect, useState } from 'react';
import { getJuntaDirectivaById } from '../services/juntasDirectivasApi';
import type { JuntaDirectiva } from '../types';
import {
  formatJuntaDate,
  getEstadoChipProps,
  getJuntasDirectivasErrorMessage,
  getPeriodoLabel,
} from './juntasDirectivasUi';

type JuntaDirectivaDetailDialogProps = {
  open: boolean;
  tenantId: string;
  juntaId?: string | number | null;
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
  tenantId,
  juntaId,
  onClose,
}: JuntaDirectivaDetailDialogProps) {
  const [junta, setJunta] = useState<JuntaDirectiva | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setJunta(null);
      setError(null);
      return;
    }

    if (!juntaId) {
      setError('No se pudo identificar la junta directiva solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadJunta = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getJuntaDirectivaById(tenantId, juntaId, controller.signal);

        if (!controller.signal.aborted) {
          setJunta(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            getJuntasDirectivasErrorMessage(
              loadError,
              'No se pudo cargar el detalle de la junta directiva.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJunta();

    return () => {
      controller.abort();
    };
  }, [open, juntaId, tenantId]);

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
