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
import { BienDetailDialog } from '../components/BienDetailDialog';
import { BienFiltersCard } from '../components/BienFiltersCard';
import { BienFormDialog } from '../components/BienFormDialog';
import { BienMobileList } from '../components/BienMobileList';
import { BienTable } from '../components/BienTable';
import { ConfirmDeactivateDialog } from '../components/ConfirmDeactivateDialog';
import { useBienes } from '../hooks/useBienes';

export function BienesPage() {
  const bienes = useBienes();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {bienes.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={bienes.openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nuevo bien
            </Button>
          </Stack>
        )}

        <BienFiltersCard
          estadoValue={bienes.estadoFilter}
          isDesktop={bienes.isDesktop}
          onClear={bienes.clearFilters}
          onEstadoChange={bienes.setEstadoFilter}
          onSearchChange={bienes.setSearchInput}
          onTipoChange={bienes.setTipoFilter}
          searchValue={bienes.searchInput}
          tipoValue={bienes.tipoFilter}
        />

        {bienes.error && (
          <Alert
            action={
              <Button color="inherit" onClick={bienes.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {bienes.error}
          </Alert>
        )}

        {bienes.initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : bienes.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay bienes registrados</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 440 }} variant="body2">
                Ajusta la búsqueda o crea un nuevo bien para comenzar a poblar el inventario.
              </Typography>
              <Button onClick={bienes.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nuevo bien
              </Button>
            </CardContent>
          </Card>
        ) : bienes.isDesktop ? (
          <Card elevation={0}>
            <BienTable
              hasMore={bienes.hasMore}
              loadingMore={bienes.loadingMore}
              onDeactivate={bienes.openDeactivateDialog}
              onEdit={bienes.openEditDialog}
              onReachEnd={bienes.handleReachEnd}
              onView={bienes.openDetailDialog}
              rows={bienes.rows}
            />
          </Card>
        ) : (
          <BienMobileList
            hasMore={bienes.hasMore}
            loadingMore={bienes.loadingMore}
            onDeactivate={bienes.openDeactivateDialog}
            onEdit={bienes.openEditDialog}
            onReachEnd={bienes.handleReachEnd}
            onView={bienes.openDetailDialog}
            rows={bienes.rows}
            total={bienes.total}
          />
        )}
      </Stack>

      {!bienes.isDesktop && (
        <Fab
          color="primary"
          onClick={bienes.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {bienes.tenantId && (
        <>
          <BienFormDialog
            bien={bienes.formBien}
            loadError={bienes.formLoadError}
            loading={bienes.formLoading}
            mode={bienes.formMode}
            onClose={bienes.closeFormDialog}
            onSubmit={bienes.submitForm}
            open={bienes.formOpen}
            submitting={bienes.formSubmitting}
          />
          <BienDetailDialog
            bien={bienes.detailBien}
            error={bienes.detailError}
            loading={bienes.detailLoading}
            onClose={bienes.closeDetailDialog}
            open={bienes.detailOpen}
          />
        </>
      )}

      <ConfirmDeactivateDialog
        bienLabel={bienes.deactivateTargetLabel}
        loading={bienes.deactivateLoading}
        onClose={bienes.closeDeactivateDialog}
        onConfirm={() => {
          void bienes.confirmDeactivate();
        }}
        open={bienes.deactivateDialogOpen}
      />

      <Toast
        message={bienes.toast.message}
        onClose={bienes.closeToast}
        open={bienes.toast.open}
        severity={bienes.toast.severity}
      />
    </Box>
  );
}
