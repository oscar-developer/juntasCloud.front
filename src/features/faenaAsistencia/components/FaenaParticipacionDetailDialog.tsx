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
import { getPersonaById } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import { getFaenaParticipacionById } from '../services/faenaAsistenciaApi';
import type { FaenaParticipacion } from '../types';
import {
  formatFaenaParticipacionDateTime,
  formatFaenaParticipacionTime,
  getAnuladoChipProps,
  getFaenaParticipacionErrorMessage,
  getFaenaParticipacionEstadoChipProps,
  getFaenaParticipacionMultaLabel,
  getPersonaLabelById,
} from './faenaParticipacionUi';

type FaenaParticipacionDetailDialogProps = {
  open: boolean;
  tenantId: string;
  participacionId?: string | number | null;
  personaCache: Record<string, Persona>;
  faenaLabel?: string;
  onPersonaResolved: (persona: Persona) => void;
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

export function FaenaParticipacionDetailDialog({
  open,
  tenantId,
  participacionId,
  personaCache,
  faenaLabel,
  onPersonaResolved,
  onClose,
}: FaenaParticipacionDetailDialogProps) {
  const [participacion, setParticipacion] = useState<FaenaParticipacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setParticipacion(null);
      setError(null);
      return;
    }

    if (!participacionId) {
      setError('No se pudo identificar la participación solicitada.');
      return;
    }

    const controller = new AbortController();

    const loadParticipacion = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getFaenaParticipacionById(tenantId, participacionId, controller.signal);

        if (!controller.signal.aborted) {
          setParticipacion(response);

          if (!personaCache[String(response.idPersona)]) {
            try {
              const persona = await getPersonaById(tenantId, response.idPersona, controller.signal);

              if (!controller.signal.aborted) {
                onPersonaResolved(persona);
              }
            } catch {
              // Mantiene fallback Persona #id cuando no se puede resolver el nombre.
            }
          }
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getFaenaParticipacionErrorMessage(loadError, 'No se pudo cargar el detalle de la participación.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadParticipacion();

    return () => {
      controller.abort();
    };
  }, [open, participacionId, tenantId, personaCache, onPersonaResolved]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de participación</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography color="text.secondary">Cargando...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : participacion ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {getPersonaLabelById(personaCache, participacion.idPersona)}
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }} useFlexGap>
                <Chip size="small" variant="outlined" {...getFaenaParticipacionEstadoChipProps(participacion.estado)} />
                <Chip size="small" variant="outlined" {...getAnuladoChipProps(participacion.anulado)} />
              </Stack>
            </Box>
            <DetailRow label="Faena" value={faenaLabel} />
            <DetailRow label="Persona" value={getPersonaLabelById(personaCache, participacion.idPersona)} />
            <DetailRow label="Hora de llegada" value={formatFaenaParticipacionTime(participacion.horaLlegada)} />
            <DetailRow label="Personas extra" value={String(participacion.cantPersonasExtra)} />
            <DetailRow label="Multa" value={getFaenaParticipacionMultaLabel(participacion)} />
            <DetailRow label="Observaciones" value={participacion.observaciones} />
            <DetailRow label="Creado" value={formatFaenaParticipacionDateTime(participacion.createdAt)} />
            <DetailRow label="Actualizado" value={formatFaenaParticipacionDateTime(participacion.updatedAt)} />
            <DetailRow label="Anulado en" value={formatFaenaParticipacionDateTime(participacion.anuladoAt)} />
            <DetailRow
              label="Anulado por usuario"
              value={participacion.anuladoByUser === null || participacion.anuladoByUser === undefined ? null : String(participacion.anuladoByUser)}
            />
            <DetailRow label="Motivo de anulación" value={participacion.motivoAnulacion} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la participación solicitada.</Alert>
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
