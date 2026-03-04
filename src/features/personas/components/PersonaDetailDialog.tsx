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
import { getPersonaById } from '../services/personasApi';
import type { Persona } from '../types';
import { getEstadoChipProps, getFullName, getPersonaErrorMessage, getTipoChipProps } from './personaUi';

type PersonaDetailDialogProps = {
  open: boolean;
  tenantId: string;
  personaId?: string | number | null;
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

export function PersonaDetailDialog({
  open,
  tenantId,
  personaId,
  onClose,
}: PersonaDetailDialogProps) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPersona(null);
      setError(null);
      return;
    }

    if (!personaId) {
      setError('No se pudo identificar la persona solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadPersona = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPersonaById(tenantId, personaId, controller.signal);

        if (!controller.signal.aborted) {
          setPersona(response);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getPersonaErrorMessage(loadError, 'No se pudo cargar el detalle de la persona.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPersona();

    return () => {
      controller.abort();
    };
  }, [open, personaId, tenantId]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de persona</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : persona ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{getFullName(persona)}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
                <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
              </Stack>
            </Box>
            <DetailRow label="DNI" value={persona.dni} />
            <DetailRow label="Teléfono" value={persona.telefono} />
            <DetailRow label="Referencia de vivienda" value={persona.referenciaVivienda} />
            <DetailRow label="Fecha de registro" value={persona.fechaRegistro?.slice(0, 10)} />
            <DetailRow label="Observaciones" value={persona.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la persona solicitada.</Alert>
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
