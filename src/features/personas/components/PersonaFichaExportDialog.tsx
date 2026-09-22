import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { PersonaConstanciaIssued } from '../types';

type PersonaFichaExportDialogProps = {
  open: boolean;
  loading: boolean;
  constancia: PersonaConstanciaIssued | null;
  onClose: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
};

export function PersonaFichaExportDialog({
  open,
  loading,
  constancia,
  onClose,
  onExportPdf,
  onExportExcel,
}: PersonaFichaExportDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Exportar ficha de persona</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography color="text.secondary" variant="body2">
            El PDF es una constancia institucional verificable. El Excel contiene el detalle de la
            ficha como anexo informativo.
          </Typography>

          {constancia ? (
            <Alert severity="success">
              Emisión preparada con el código <strong>{constancia.codigo}</strong>. Ambos formatos
              usarán esta misma referencia mientras el diálogo permanezca abierto.
            </Alert>
          ) : (
            <Alert severity="info">
              La primera descarga registrará una nueva emisión y generará su código de verificación.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              disabled={loading}
              fullWidth
              onClick={onExportPdf}
              startIcon={loading ? <CircularProgress color="inherit" size={18} /> : <PictureAsPdfRoundedIcon />}
              variant="contained"
            >
              Descargar PDF
            </Button>
            <Button
              disabled={loading}
              fullWidth
              onClick={onExportExcel}
              startIcon={<TableViewRoundedIcon />}
              variant="outlined"
            >
              Descargar Excel
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
