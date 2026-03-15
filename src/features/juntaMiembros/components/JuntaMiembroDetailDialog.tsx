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
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import { getPersonaById } from '../../personas/services/personasApi';
import type { Persona } from '../../personas/types';
import { getJuntaMiembroById } from '../services/juntaMiembrosApi';
import type { JuntaMiembro } from '../types';
import {
  formatJuntaMiembroDate,
  getCargoChipProps,
  getJuntaLabelById,
  getJuntaMiembroErrorMessage,
  getJuntaMiembroPeriodoLabel,
  getPersonaLabelById,
} from './juntaMiembrosUi';

type JuntaMiembroDetailDialogProps = {
  open: boolean;
  tenantId: string;
  juntaMiembroId?: string | number | null;
  juntas: JuntaDirectiva[];
  personaCache: Record<string, Persona>;
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

export function JuntaMiembroDetailDialog({
  open,
  tenantId,
  juntaMiembroId,
  juntas,
  personaCache,
  onPersonaResolved,
  onClose,
}: JuntaMiembroDetailDialogProps) {
  const [juntaMiembro, setJuntaMiembro] = useState<JuntaMiembro | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setJuntaMiembro(null);
      setError(null);
      return;
    }

    if (!juntaMiembroId) {
      setError('No se pudo identificar el miembro de junta solicitado.');
      return;
    }

    const controller = new AbortController();

    const loadJuntaMiembro = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getJuntaMiembroById(tenantId, juntaMiembroId, controller.signal);

        if (!controller.signal.aborted) {
          setJuntaMiembro(response);

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
          setError(
            getJuntaMiembroErrorMessage(
              loadError,
              'No se pudo cargar el detalle del miembro de junta.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJuntaMiembro();

    return () => {
      controller.abort();
    };
  }, [juntaMiembroId, onPersonaResolved, open, personaCache, tenantId]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de miembro de junta</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography color="text.secondary">Cargando...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : juntaMiembro ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {getPersonaLabelById(personaCache, juntaMiembro.idPersona)}
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }} useFlexGap>
                <Chip size="small" variant="outlined" {...getCargoChipProps(juntaMiembro.cargo)} />
              </Stack>
            </Box>
            <DetailRow label="Junta directiva" value={getJuntaLabelById(juntas, juntaMiembro.idJunta)} />
            <DetailRow label="Persona" value={getPersonaLabelById(personaCache, juntaMiembro.idPersona)} />
            <DetailRow label="Periodo" value={getJuntaMiembroPeriodoLabel(juntaMiembro)} />
            <DetailRow label="Fecha de inicio" value={formatJuntaMiembroDate(juntaMiembro.fechaInicio)} />
            <DetailRow label="Fecha de fin" value={formatJuntaMiembroDate(juntaMiembro.fechaFin)} />
            <DetailRow label="Observaciones" value={juntaMiembro.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontro el miembro de junta solicitado.</Alert>
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
