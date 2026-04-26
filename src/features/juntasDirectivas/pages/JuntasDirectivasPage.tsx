import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Card, CardContent, Fab, LinearProgress, Stack, Typography } from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmDeleteJuntaDirectivaDialog } from '../components/ConfirmDeleteJuntaDirectivaDialog';
import { JuntaDirectivaDetailDialog } from '../components/JuntaDirectivaDetailDialog';
import { JuntaDirectivaFormDialog } from '../components/JuntaDirectivaFormDialog';
import { JuntasDirectivasFiltersCard } from '../components/JuntasDirectivasFiltersCard';
import { JuntasDirectivasMobileList } from '../components/JuntasDirectivasMobileList';
import { JuntasDirectivasTable } from '../components/JuntasDirectivasTable';
import { useJuntasDirectivas } from '../hooks/useJuntasDirectivas';

export function JuntasDirectivasPage() {
  const juntasDirectivas = useJuntasDirectivas();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {juntasDirectivas.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              onClick={juntasDirectivas.openCreateDialog}
              startIcon={<AddRoundedIcon />}
              variant="contained"
            >
              Nueva junta directiva
            </Button>
          </Stack>
        )}

        <JuntasDirectivasFiltersCard
          estadoValue={juntasDirectivas.estadoFilter}
          fromValue={juntasDirectivas.fromFilter}
          onClear={juntasDirectivas.clearFilters}
          onEstadoChange={juntasDirectivas.setEstadoFilter}
          onFromChange={juntasDirectivas.setFromFilter}
          onToChange={juntasDirectivas.setToFilter}
          toValue={juntasDirectivas.toFilter}
        />

        {juntasDirectivas.error && (
          <Alert
            action={
              <Button color="inherit" onClick={juntasDirectivas.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {juntasDirectivas.error}
          </Alert>
        )}

        {juntasDirectivas.loading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : juntasDirectivas.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay juntas directivas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta los filtros o crea una nueva junta directiva para comenzar a registrar periodos.
              </Typography>
              <Button onClick={juntasDirectivas.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva junta directiva
              </Button>
            </CardContent>
          </Card>
        ) : juntasDirectivas.isDesktop ? (
          <Card elevation={0}>
            <JuntasDirectivasTable
              onDelete={juntasDirectivas.openDeleteDialog}
              onEdit={juntasDirectivas.openEditDialog}
              onView={juntasDirectivas.openDetailDialog}
              rows={juntasDirectivas.rows}
            />
          </Card>
        ) : (
          <JuntasDirectivasMobileList
            onDelete={juntasDirectivas.openDeleteDialog}
            onEdit={juntasDirectivas.openEditDialog}
            onView={juntasDirectivas.openDetailDialog}
            rows={juntasDirectivas.rows}
          />
        )}
      </Stack>

      {!juntasDirectivas.isDesktop && (
        <Fab
          color="primary"
          onClick={juntasDirectivas.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {juntasDirectivas.tenantId && (
        <>
          <JuntaDirectivaFormDialog
            junta={juntasDirectivas.formJunta}
            loadError={juntasDirectivas.formLoadError}
            loading={juntasDirectivas.formLoading}
            mode={juntasDirectivas.formMode}
            onClose={juntasDirectivas.closeFormDialog}
            onSubmit={juntasDirectivas.submitForm}
            open={juntasDirectivas.formOpen}
            submitting={juntasDirectivas.formSubmitting}
          />
          <JuntaDirectivaDetailDialog
            error={juntasDirectivas.detailError}
            junta={juntasDirectivas.detailJunta}
            loading={juntasDirectivas.detailLoading}
            onClose={juntasDirectivas.closeDetailDialog}
            open={juntasDirectivas.detailOpen}
          />
        </>
      )}

      <ConfirmDeleteJuntaDirectivaDialog
        juntaName={juntasDirectivas.deleteTargetName}
        loading={juntasDirectivas.deleteLoading}
        onClose={juntasDirectivas.closeDeleteDialog}
        onConfirm={() => {
          void juntasDirectivas.confirmDelete();
        }}
        open={juntasDirectivas.deleteDialogOpen}
      />

      <Toast
        message={juntasDirectivas.toast.message}
        onClose={juntasDirectivas.closeToast}
        open={juntasDirectivas.toast.open}
        severity={juntasDirectivas.toast.severity}
      />
    </Box>
  );
}
