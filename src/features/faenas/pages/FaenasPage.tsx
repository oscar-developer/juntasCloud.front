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
import { ConfirmDeleteFaenaDialog } from '../components/ConfirmDeleteFaenaDialog';
import { FaenaDetailDialog } from '../components/FaenaDetailDialog';
import { FaenaFiltersCard } from '../components/FaenaFiltersCard';
import { FaenaFormDialog } from '../components/FaenaFormDialog';
import { FaenaMobileFiltersDialog } from '../components/FaenaMobileFiltersDialog';
import { FaenaMobileList } from '../components/FaenaMobileList';
import { FaenaTable } from '../components/FaenaTable';
import { useFaenas } from '../hooks/useFaenas';

export function FaenasPage() {
  const faenas = useFaenas();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {faenas.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={faenas.openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva faena
            </Button>
          </Stack>
        )}

        <FaenaFiltersCard
          estadoValue={faenas.filters.estado}
          fromValue={faenas.filters.from}
          isDesktop={faenas.isDesktop}
          onClear={faenas.clearFilters}
          onEstadoChange={(value) => faenas.updateFilters({ estado: value })}
          onFromChange={(value) => faenas.updateFilters({ from: value })}
          onOpenMobileFilters={faenas.openMobileFilters}
          onSearchChange={(value) => faenas.updateFilters({ search: value })}
          onTipoFaenaChange={(value) => faenas.updateFilters({ tipoFaena: value })}
          onToChange={(value) => faenas.updateFilters({ to: value })}
          searchValue={faenas.filters.search}
          tipoFaenaValue={faenas.filters.tipoFaena}
          toValue={faenas.filters.to}
        />

        {faenas.error && (
          <Alert
            action={
              <Button color="inherit" onClick={faenas.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {faenas.error}
          </Alert>
        )}

        {faenas.loading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : faenas.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay faenas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta el rango de fechas o crea una nueva faena para comenzar a planificar actividades.
              </Typography>
              <Button onClick={faenas.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva faena
              </Button>
            </CardContent>
          </Card>
        ) : faenas.isDesktop ? (
          <Card elevation={0}>
            <FaenaTable
              attendanceBasePath={faenas.attendanceBasePath}
              onDelete={faenas.openDeleteDialog}
              onEdit={faenas.openEditDialog}
              onView={faenas.openDetailDialog}
              rows={faenas.rows}
            />
          </Card>
        ) : (
          <FaenaMobileList
            activeFilters={faenas.appliedFiltersSummary}
            attendanceBasePath={faenas.attendanceBasePath}
            onDelete={faenas.openDeleteDialog}
            onEdit={faenas.openEditDialog}
            onView={faenas.openDetailDialog}
            rows={faenas.rows}
            total={faenas.total}
          />
        )}
      </Stack>

      {!faenas.isDesktop && (
        <Fab
          color="primary"
          onClick={faenas.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {faenas.tenantId && (
        <>
          <FaenaFormDialog
            faena={faenas.formFaena}
            loadError={faenas.formLoadError}
            loading={faenas.formLoading}
            mode={faenas.formMode}
            onClose={faenas.closeFormDialog}
            onSubmit={faenas.submitForm}
            open={faenas.formOpen}
            submitting={faenas.formSubmitting}
          />
          <FaenaDetailDialog
            error={faenas.detailError}
            faena={faenas.detailFaena}
            loading={faenas.detailLoading}
            onClose={faenas.closeDetailDialog}
            open={faenas.detailOpen}
          />
          <FaenaMobileFiltersDialog
            filters={faenas.mobileDraftFilters}
            onApply={faenas.applyMobileFilters}
            onChange={faenas.updateMobileDraftFilters}
            onClear={faenas.clearMobileDraftFilters}
            onClose={faenas.closeMobileFilters}
            open={faenas.mobileFiltersOpen}
          />
        </>
      )}

      <ConfirmDeleteFaenaDialog
        faenaLabel={faenas.deleteTargetLabel}
        loading={faenas.deleteLoading}
        onClose={faenas.closeDeleteDialog}
        onConfirm={() => {
          void faenas.confirmDelete();
        }}
        open={faenas.deleteDialogOpen}
      />

      <Toast
        message={faenas.toast.message}
        onClose={faenas.closeToast}
        open={faenas.toast.open}
        severity={faenas.toast.severity}
      />
    </Box>
  );
}
