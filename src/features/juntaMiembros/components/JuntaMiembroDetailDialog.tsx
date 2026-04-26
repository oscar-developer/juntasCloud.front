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
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import type { Persona } from '../../personas/types';
import type { JuntaMiembro } from '../types';
import {
  formatJuntaMiembroDate,
  getCargoChipProps,
  getJuntaLabelById,
  getJuntaMiembroPeriodoLabel,
  getPersonaLabelById,
} from './juntaMiembrosUi';

type JuntaMiembroDetailDialogProps = {
  open: boolean;
  juntaMiembro?: JuntaMiembro | null;
  loading: boolean;
  error?: string | null;
  juntas: JuntaDirectiva[];
  personaCache: Record<string, Persona>;
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
  juntaMiembro,
  loading,
  error,
  juntas,
  personaCache,
  onClose,
}: JuntaMiembroDetailDialogProps) {
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
