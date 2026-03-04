import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

type ExportPersonasDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
};

export function ExportPersonasDialog({
  open,
  loading,
  onClose,
  onExportPdf,
  onExportExcel,
}: ExportPersonasDialogProps) {
  return (
    <Dialog fullWidth maxWidth="xs" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Exportar listado</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2">
          Descarga el listado de personas filtrado en formato PDF o Excel.
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Button disabled={loading} onClick={onExportPdf} variant="contained">
            {loading ? <CircularProgress color="inherit" size={20} /> : 'Descargar PDF'}
          </Button>
          <Button disabled={loading} onClick={onExportExcel} variant="outlined">
            Descargar Excel
          </Button>
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
