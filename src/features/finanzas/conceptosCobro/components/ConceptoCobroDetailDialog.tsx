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
import type { ConceptoCobro } from '../types';
import {
  CONCEPTO_COBRO_TIPO_LABELS,
  getActivoChipProps,
  getRequierePeriodoChipProps,
  getTipoConceptoCobroChipProps,
} from './conceptosCobroUi';

type ConceptoCobroDetailDialogProps = {
  open: boolean;
  concepto?: ConceptoCobro | null;
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

export function ConceptoCobroDetailDialog({
  open,
  concepto,
  loading,
  error,
  onClose,
}: ConceptoCobroDetailDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de concepto de cobro</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : concepto ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {concepto.nombre || 'Concepto sin nombre'}
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }} useFlexGap>
                <Chip size="small" variant="outlined" {...getTipoConceptoCobroChipProps(concepto.tipo)} />
                <Chip size="small" variant="outlined" {...getActivoChipProps(concepto.activo)} />
                <Chip
                  size="small"
                  variant="outlined"
                  {...getRequierePeriodoChipProps(concepto.requierePeriodo)}
                />
              </Stack>
            </Box>
            <DetailRow label="ID concepto" value={String(concepto.idConceptoCobro)} />
            <DetailRow label="Tipo" value={CONCEPTO_COBRO_TIPO_LABELS[concepto.tipo]} />
            <DetailRow label="Estado" value={concepto.activo ? 'Activo' : 'Inactivo'} />
            <DetailRow
              label="Requiere periodo"
              value={concepto.requierePeriodo ? 'Sí' : 'No'}
            />
            <DetailRow label="Observaciones" value={concepto.observaciones} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró el concepto solicitado.</Alert>
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
