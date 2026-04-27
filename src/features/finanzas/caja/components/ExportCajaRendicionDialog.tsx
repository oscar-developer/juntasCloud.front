import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { JuntaDirectiva } from '../../../juntasDirectivas/types';

type ExportCajaRendicionDialogProps = {
  open: boolean;
  loading: boolean;
  contextLoading: boolean;
  contextError?: string | null;
  juntas: JuntaDirectiva[];
  selectedJuntaId: string;
  onJuntaChange: (value: string) => void;
  onClose: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
};

function getJuntaLabel(junta: JuntaDirectiva) {
  const estado = junta.estado ? ` · ${junta.estado}` : '';
  const periodo = junta.fechaInicio && junta.fechaFin ? ` (${junta.fechaInicio} - ${junta.fechaFin})` : '';

  return `${junta.nombre || `Junta #${junta.idJunta}`}${estado}${periodo}`;
}

export function ExportCajaRendicionDialog({
  open,
  loading,
  contextLoading,
  contextError,
  juntas,
  selectedJuntaId,
  onJuntaChange,
  onClose,
  onExportPdf,
  onExportExcel,
}: ExportCajaRendicionDialogProps) {
  const disabled = loading || contextLoading || Boolean(contextError) || juntas.length === 0 || !selectedJuntaId;

  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Exportar rendición de cuentas</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Descarga la rendición de cuentas por junta directiva en formato PDF o Excel.
          </Typography>

          {contextError && <Alert severity="error">{contextError}</Alert>}
          {!contextLoading && !contextError && juntas.length === 0 && (
            <Alert severity="info">No hay juntas directivas disponibles para generar el reporte.</Alert>
          )}

          <TextField
            disabled={contextLoading || loading || juntas.length === 0}
            fullWidth
            helperText="El reporte usa la junta seleccionada; los filtros de la tabla no aplican a este endpoint."
            label="Junta directiva"
            onChange={(event) => onJuntaChange(event.target.value)}
            select
            value={selectedJuntaId}
          >
            {juntas.map((junta) => (
              <MenuItem key={junta.idJunta} value={String(junta.idJunta)}>
                {getJuntaLabel(junta)}
              </MenuItem>
            ))}
          </TextField>

          <Stack spacing={1.5}>
            <Button disabled={disabled} onClick={onExportPdf} variant="contained">
              {loading ? <CircularProgress color="inherit" size={20} /> : 'Descargar PDF'}
            </Button>
            <Button disabled={disabled} onClick={onExportExcel} variant="outlined">
              Descargar Excel
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="text">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
