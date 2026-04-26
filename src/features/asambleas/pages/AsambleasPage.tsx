import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { AsambleaDetailDialog } from '../components/AsambleaDetailDialog';
import { AsambleaFormDialog } from '../components/AsambleaFormDialog';
import { AsambleasFiltersCard } from '../components/AsambleasFiltersCard';
import { AsambleasMobileFiltersDialog } from '../components/AsambleasMobileFiltersDialog';
import { AsambleasMobileList } from '../components/AsambleasMobileList';
import { AsambleasTable } from '../components/AsambleasTable';
import { ConfirmDeleteAsambleaDialog } from '../components/ConfirmDeleteAsambleaDialog';
import { useAsambleas } from '../hooks/useAsambleas';

export function AsambleasPage() {
  const asambleas = useAsambleas();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {asambleas.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={asambleas.openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva asamblea
            </Button>
          </Stack>
        )}

        <AsambleasFiltersCard
          convocatoriaValue={asambleas.filters.convocatoria}
          estadoValue={asambleas.filters.estado}
          fromValue={asambleas.filters.from}
          isDesktop={asambleas.isDesktop}
          onClear={asambleas.clearFilters}
          onConvocatoriaChange={(value) => asambleas.updateFilters({ convocatoria: value })}
          onEstadoChange={(value) => asambleas.updateFilters({ estado: value })}
          onFromChange={(value) => asambleas.updateFilters({ from: value })}
          onOpenMobileFilters={asambleas.openMobileFilters}
          onTipoChange={(value) => asambleas.updateFilters({ tipo: value })}
          onToChange={(value) => asambleas.updateFilters({ to: value })}
          tipoValue={asambleas.filters.tipo}
          toValue={asambleas.filters.to}
        />

        {asambleas.error && (
          <Alert
            action={
              <Button color="inherit" onClick={asambleas.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {asambleas.error}
          </Alert>
        )}

        {asambleas.loading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : asambleas.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay asambleas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta el rango de fechas o crea una nueva asamblea para comenzar a organizar reuniones.
              </Typography>
              <Button onClick={asambleas.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva asamblea
              </Button>
            </CardContent>
          </Card>
        ) : asambleas.isDesktop ? (
          <Card elevation={0}>
            <AsambleasTable
              attendanceBasePath={asambleas.attendanceBasePath}
              onDelete={asambleas.openDeleteDialog}
              onEdit={asambleas.openEditDialog}
              onView={asambleas.openDetailDialog}
              rows={asambleas.rows}
            />
          </Card>
        ) : (
          <AsambleasMobileList
            activeFilters={asambleas.appliedFiltersSummary}
            attendanceBasePath={asambleas.attendanceBasePath}
            onDelete={asambleas.openDeleteDialog}
            onEdit={asambleas.openEditDialog}
            onView={asambleas.openDetailDialog}
            rows={asambleas.rows}
            total={asambleas.total}
          />
        )}
      </Stack>

      {!asambleas.isDesktop && (
        <Fab color="primary" onClick={asambleas.openCreateDialog} sx={{ position: 'fixed', right: 24, bottom: 24 }}>
          <AddRoundedIcon />
        </Fab>
      )}

      {asambleas.tenantId && (
        <>
          <AsambleaFormDialog
            asamblea={asambleas.formAsamblea}
            loadError={asambleas.formLoadError}
            loading={asambleas.formLoading}
            mode={asambleas.formMode}
            onClose={asambleas.closeFormDialog}
            onSubmit={asambleas.submitForm}
            open={asambleas.formOpen}
            submitting={asambleas.formSubmitting}
          />
          <AsambleaDetailDialog
            asamblea={asambleas.detailAsamblea}
            error={asambleas.detailError}
            loading={asambleas.detailLoading}
            onClose={asambleas.closeDetailDialog}
            open={asambleas.detailOpen}
          />
          <AsambleasMobileFiltersDialog
            filters={asambleas.mobileDraftFilters}
            onApply={asambleas.applyMobileFilters}
            onChange={asambleas.updateMobileDraftFilters}
            onClear={asambleas.clearMobileDraftFilters}
            onClose={asambleas.closeMobileFilters}
            open={asambleas.mobileFiltersOpen}
          />
        </>
      )}

      <ConfirmDeleteAsambleaDialog
        asambleaLabel={asambleas.deleteTargetLabel}
        loading={asambleas.deleteLoading}
        onClose={asambleas.closeDeleteDialog}
        onConfirm={() => {
          void asambleas.confirmDelete();
        }}
        open={asambleas.deleteDialogOpen}
      />

      <Toast
        message={asambleas.toast.message}
        onClose={asambleas.closeToast}
        open={asambleas.toast.open}
        severity={asambleas.toast.severity}
      />
    </Box>
  );
}
