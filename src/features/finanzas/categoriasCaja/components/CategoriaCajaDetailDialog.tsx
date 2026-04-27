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
import type { CajaCategoria } from '../types';
import { getActivoChipProps, getTipoCategoriaCajaChipProps } from './categoriasCajaUi';

type CategoriaCajaDetailDialogProps = {
  open: boolean;
  categoria?: CajaCategoria | null;
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

export function CategoriaCajaDetailDialog({
  open,
  categoria,
  loading,
  error,
  onClose,
}: CategoriaCajaDetailDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Detalle de categoría de caja</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : categoria ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                {categoria.nombre || 'Categoría sin nombre'}
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 1 }} useFlexGap>
                <Chip size="small" variant="outlined" {...getTipoCategoriaCajaChipProps(categoria.tipo)} />
                <Chip size="small" variant="outlined" {...getActivoChipProps(categoria.activo)} />
              </Stack>
            </Box>
            <DetailRow label="ID categoría" value={String(categoria.idCategoriaCaja)} />
            <DetailRow label="Tipo" value={categoria.tipo} />
            <DetailRow label="Estado" value={categoria.activo ? 'Activo' : 'Inactivo'} />
          </Stack>
        ) : (
          <Alert severity="info">No se encontró la categoría solicitada.</Alert>
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
