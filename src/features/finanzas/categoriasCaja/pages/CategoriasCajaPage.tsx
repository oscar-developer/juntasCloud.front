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
import { CategoriaCajaDetailDialog } from '../components/CategoriaCajaDetailDialog';
import { CategoriaCajaFiltersCard } from '../components/CategoriaCajaFiltersCard';
import { CategoriaCajaFormDialog } from '../components/CategoriaCajaFormDialog';
import { CategoriaCajaMobileList } from '../components/CategoriaCajaMobileList';
import { CategoriaCajaTable } from '../components/CategoriaCajaTable';
import { ConfirmDeleteCategoriaCajaDialog } from '../components/ConfirmDeleteCategoriaCajaDialog';
import { useCategoriasCaja } from '../hooks/useCategoriasCaja';

export function CategoriasCajaPage() {
  const categoriasCaja = useCategoriasCaja();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {categoriasCaja.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={categoriasCaja.openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained">
              Nueva categoría
            </Button>
          </Stack>
        )}

        <CategoriaCajaFiltersCard
          activoValue={categoriasCaja.activoFilter}
          isDesktop={categoriasCaja.isDesktop}
          onActivoChange={categoriasCaja.setActivoFilter}
          onClear={categoriasCaja.clearFilters}
          onSearchChange={categoriasCaja.setSearchInput}
          onTipoChange={categoriasCaja.setTipoFilter}
          searchValue={categoriasCaja.searchInput}
          tipoValue={categoriasCaja.tipoFilter}
        />

        {categoriasCaja.error && (
          <Alert
            action={
              <Button color="inherit" onClick={categoriasCaja.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {categoriasCaja.error}
          </Alert>
        )}

        {categoriasCaja.initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : categoriasCaja.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay categorías de caja registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 440 }} variant="body2">
                Ajusta la búsqueda o crea una nueva categoría para clasificar movimientos de caja.
              </Typography>
              <Button onClick={categoriasCaja.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva categoría
              </Button>
            </CardContent>
          </Card>
        ) : categoriasCaja.isDesktop ? (
          <Card elevation={0}>
            <CategoriaCajaTable
              onDelete={categoriasCaja.openDeleteDialog}
              onEdit={categoriasCaja.openEditDialog}
              onView={categoriasCaja.openDetailDialog}
              rows={categoriasCaja.rows}
            />
          </Card>
        ) : (
          <CategoriaCajaMobileList
            onDelete={categoriasCaja.openDeleteDialog}
            onEdit={categoriasCaja.openEditDialog}
            onView={categoriasCaja.openDetailDialog}
            rows={categoriasCaja.rows}
            total={categoriasCaja.total}
          />
        )}
      </Stack>

      {!categoriasCaja.isDesktop && (
        <Fab
          color="primary"
          onClick={categoriasCaja.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {categoriasCaja.tenantId && (
        <>
          <CategoriaCajaFormDialog
            categoria={categoriasCaja.formCategoria}
            loadError={categoriasCaja.formLoadError}
            loading={categoriasCaja.formLoading}
            mode={categoriasCaja.formMode}
            onClose={categoriasCaja.closeFormDialog}
            onSubmit={categoriasCaja.submitForm}
            open={categoriasCaja.formOpen}
            submitting={categoriasCaja.formSubmitting}
          />
          <CategoriaCajaDetailDialog
            categoria={categoriasCaja.detailCategoria}
            error={categoriasCaja.detailError}
            loading={categoriasCaja.detailLoading}
            onClose={categoriasCaja.closeDetailDialog}
            open={categoriasCaja.detailOpen}
          />
        </>
      )}

      <ConfirmDeleteCategoriaCajaDialog
        categoriaLabel={categoriasCaja.deleteTargetLabel}
        loading={categoriasCaja.deleteLoading}
        onClose={categoriasCaja.closeDeleteDialog}
        onConfirm={() => {
          void categoriasCaja.confirmDelete();
        }}
        open={categoriasCaja.deleteDialogOpen}
      />

      <Toast
        message={categoriasCaja.toast.message}
        onClose={categoriasCaja.closeToast}
        open={categoriasCaja.toast.open}
        severity={categoriasCaja.toast.severity}
      />
    </Box>
  );
}
