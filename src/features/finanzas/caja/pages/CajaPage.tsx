import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Card, CardContent, Fab, LinearProgress, Stack, Typography } from '@mui/material';
import { Toast } from '../../../../shared/ui/Toast';
import { CajaMovimientoFormDialog } from '../components/CajaMovimientoFormDialog';
import { CajaMovimientosFilters } from '../components/CajaMovimientosFilters';
import { CajaMovimientosMobileList } from '../components/CajaMovimientosMobileList';
import { CajaMovimientosTable } from '../components/CajaMovimientosTable';
import { ConfirmAnularMovimientoDialog } from '../components/ConfirmAnularMovimientoDialog';
import { ExportCajaRendicionDialog } from '../components/ExportCajaRendicionDialog';
import { useCajaMovimientos } from '../hooks/useCajaMovimientos';

export function CajaPage() {
  const cajaMovimientos = useCajaMovimientos();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {cajaMovimientos.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              onClick={cajaMovimientos.openCreateDialog}
              startIcon={<AddRoundedIcon />}
              variant="contained"
            >
              Nuevo movimiento
            </Button>
          </Stack>
        )}

        <CajaMovimientosFilters
          exportLoading={cajaMovimientos.exportLoading}
          fromValue={cajaMovimientos.fromFilter}
          onClear={cajaMovimientos.clearFilters}
          onExportClick={cajaMovimientos.openExportDialog}
          onFromChange={cajaMovimientos.setFromFilter}
          onTipoChange={cajaMovimientos.setTipoFilter}
          onToChange={cajaMovimientos.setToFilter}
          tipoValue={cajaMovimientos.tipoFilter}
          toValue={cajaMovimientos.toFilter}
        />

        {cajaMovimientos.error && (
          <Alert
            action={
              <Button color="inherit" onClick={cajaMovimientos.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {cajaMovimientos.error}
          </Alert>
        )}

        {cajaMovimientos.initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : cajaMovimientos.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay movimientos de caja registrados</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta los filtros o registra un nuevo ingreso o egreso para comenzar a controlar la caja.
              </Typography>
              <Button onClick={cajaMovimientos.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nuevo movimiento
              </Button>
            </CardContent>
          </Card>
        ) : cajaMovimientos.isDesktop ? (
          <Card elevation={0}>
            <CajaMovimientosTable
              onAnular={cajaMovimientos.openAnularDialog}
              onEdit={cajaMovimientos.openEditDialog}
              onPageChange={cajaMovimientos.handlePageChange}
              onRowsPerPageChange={cajaMovimientos.handleRowsPerPageChange}
              page={cajaMovimientos.page}
              rows={cajaMovimientos.rows}
              rowsPerPage={cajaMovimientos.rowsPerPage}
              total={cajaMovimientos.total}
            />
          </Card>
        ) : (
          <CajaMovimientosMobileList
            onAnular={cajaMovimientos.openAnularDialog}
            onEdit={cajaMovimientos.openEditDialog}
            rows={cajaMovimientos.rows}
            total={cajaMovimientos.total}
          />
        )}
      </Stack>

      {!cajaMovimientos.isDesktop && (
        <Fab
          color="primary"
          onClick={cajaMovimientos.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {cajaMovimientos.tenantId && (
        <CajaMovimientoFormDialog
          loadError={cajaMovimientos.formLoadError}
          loading={cajaMovimientos.formLoading}
          mode={cajaMovimientos.formMode}
          movimiento={cajaMovimientos.formMovimiento}
          onClose={cajaMovimientos.closeFormDialog}
          onShowMessage={cajaMovimientos.showMessage}
          onSubmit={cajaMovimientos.submitForm}
          open={cajaMovimientos.formOpen}
          submitting={cajaMovimientos.formSubmitting}
          tenantId={cajaMovimientos.tenantId}
        />
      )}

      <ExportCajaRendicionDialog
        contextError={cajaMovimientos.exportContextError}
        contextLoading={cajaMovimientos.exportContextLoading}
        juntas={cajaMovimientos.juntas}
        loading={cajaMovimientos.exportLoading}
        onClose={cajaMovimientos.closeExportDialog}
        onExportExcel={() => {
          void cajaMovimientos.handleExport('excel');
        }}
        onExportPdf={() => {
          void cajaMovimientos.handleExport('pdf');
        }}
        onJuntaChange={cajaMovimientos.setSelectedExportJuntaId}
        open={cajaMovimientos.exportOpen}
        selectedJuntaId={cajaMovimientos.selectedExportJuntaId}
      />

      <ConfirmAnularMovimientoDialog
        loading={cajaMovimientos.anularLoading}
        movimientoLabel={cajaMovimientos.anularTargetLabel}
        onClose={cajaMovimientos.closeAnularDialog}
        onConfirm={(motivoAnulacion) => {
          void cajaMovimientos.confirmAnular(motivoAnulacion);
        }}
        open={cajaMovimientos.anularDialogOpen}
      />

      <Toast
        message={cajaMovimientos.toast.message}
        onClose={cajaMovimientos.closeToast}
        open={cajaMovimientos.toast.open}
        severity={cajaMovimientos.toast.severity}
      />
    </Box>
  );
}
