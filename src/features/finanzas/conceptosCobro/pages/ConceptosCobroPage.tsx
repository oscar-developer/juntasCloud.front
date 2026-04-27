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
import { Toast } from '../../../../shared/ui/Toast';
import { ConceptoCobroDetailDialog } from '../components/ConceptoCobroDetailDialog';
import { ConceptoCobroFiltersCard } from '../components/ConceptoCobroFiltersCard';
import { ConceptoCobroFormDialog } from '../components/ConceptoCobroFormDialog';
import { ConceptoCobroMobileList } from '../components/ConceptoCobroMobileList';
import { ConceptoCobroTable } from '../components/ConceptoCobroTable';
import { ConfirmDeleteConceptoCobroDialog } from '../components/ConfirmDeleteConceptoCobroDialog';
import { useConceptosCobro } from '../hooks/useConceptosCobro';

export function ConceptosCobroPage() {
  const conceptosCobro = useConceptosCobro();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {conceptosCobro.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={conceptosCobro.openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nuevo concepto
            </Button>
          </Stack>
        )}

        <ConceptoCobroFiltersCard
          activoValue={conceptosCobro.activoFilter}
          isDesktop={conceptosCobro.isDesktop}
          onActivoChange={conceptosCobro.setActivoFilter}
          onClear={conceptosCobro.clearFilters}
          onRequierePeriodoChange={conceptosCobro.setRequierePeriodoFilter}
          onSearchChange={conceptosCobro.setSearchInput}
          onTipoChange={conceptosCobro.setTipoFilter}
          requierePeriodoValue={conceptosCobro.requierePeriodoFilter}
          searchValue={conceptosCobro.searchInput}
          tipoValue={conceptosCobro.tipoFilter}
        />

        {conceptosCobro.error && (
          <Alert
            action={
              <Button color="inherit" onClick={conceptosCobro.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {conceptosCobro.error}
          </Alert>
        )}

        {conceptosCobro.initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : conceptosCobro.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay conceptos de cobro registrados</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 440 }} variant="body2">
                Ajusta la búsqueda o crea un nuevo concepto para configurar la cobranza.
              </Typography>
              <Button onClick={conceptosCobro.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nuevo concepto
              </Button>
            </CardContent>
          </Card>
        ) : conceptosCobro.isDesktop ? (
          <Card elevation={0}>
            <ConceptoCobroTable
              onDelete={conceptosCobro.openDeleteDialog}
              onEdit={conceptosCobro.openEditDialog}
              onView={conceptosCobro.openDetailDialog}
              rows={conceptosCobro.rows}
            />
          </Card>
        ) : (
          <ConceptoCobroMobileList
            onDelete={conceptosCobro.openDeleteDialog}
            onEdit={conceptosCobro.openEditDialog}
            onView={conceptosCobro.openDetailDialog}
            rows={conceptosCobro.rows}
            total={conceptosCobro.total}
          />
        )}
      </Stack>

      {!conceptosCobro.isDesktop && (
        <Fab
          color="primary"
          onClick={conceptosCobro.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {conceptosCobro.tenantId && (
        <>
          <ConceptoCobroFormDialog
            concepto={conceptosCobro.formConcepto}
            loadError={conceptosCobro.formLoadError}
            loading={conceptosCobro.formLoading}
            mode={conceptosCobro.formMode}
            onClose={conceptosCobro.closeFormDialog}
            onSubmit={conceptosCobro.submitForm}
            open={conceptosCobro.formOpen}
            submitting={conceptosCobro.formSubmitting}
          />
          <ConceptoCobroDetailDialog
            concepto={conceptosCobro.detailConcepto}
            error={conceptosCobro.detailError}
            loading={conceptosCobro.detailLoading}
            onClose={conceptosCobro.closeDetailDialog}
            open={conceptosCobro.detailOpen}
          />
        </>
      )}

      <ConfirmDeleteConceptoCobroDialog
        conceptoLabel={conceptosCobro.deleteTargetLabel}
        loading={conceptosCobro.deleteLoading}
        onClose={conceptosCobro.closeDeleteDialog}
        onConfirm={() => {
          void conceptosCobro.confirmDelete();
        }}
        open={conceptosCobro.deleteDialogOpen}
      />

      <Toast
        message={conceptosCobro.toast.message}
        onClose={conceptosCobro.closeToast}
        open={conceptosCobro.toast.open}
        severity={conceptosCobro.toast.severity}
      />
    </Box>
  );
}
