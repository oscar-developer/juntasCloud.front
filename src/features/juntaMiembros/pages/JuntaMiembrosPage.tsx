import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Card, CardContent, Fab, LinearProgress, Stack, Typography } from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmDeleteJuntaMiembroDialog } from '../components/ConfirmDeleteJuntaMiembroDialog';
import { JuntaMiembroDetailDialog } from '../components/JuntaMiembroDetailDialog';
import { JuntaMiembroFormDialog } from '../components/JuntaMiembroFormDialog';
import { JuntaMiembrosFiltersCard } from '../components/JuntaMiembrosFiltersCard';
import { JuntaMiembrosMobileList } from '../components/JuntaMiembrosMobileList';
import { JuntaMiembrosTable } from '../components/JuntaMiembrosTable';
import { getPersonaLabelById } from '../components/juntaMiembrosUi';
import { useJuntaMiembros } from '../hooks/useJuntaMiembros';

export function JuntaMiembrosPage() {
  const juntaMiembros = useJuntaMiembros();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {juntaMiembros.isDesktop && juntaMiembros.hasJuntas && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              onClick={juntaMiembros.openCreateDialog}
              startIcon={<AddRoundedIcon />}
              variant="contained"
            >
              Nuevo miembro
            </Button>
          </Stack>
        )}

        {juntaMiembros.contextError && (
          <Alert
            action={
              <Button color="inherit" onClick={juntaMiembros.retryContext} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {juntaMiembros.contextError}
          </Alert>
        )}

        {juntaMiembros.loadingContext ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : juntaMiembros.showNoJuntasState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">Debes crear al menos una junta directiva</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 480 }} variant="body2">
                Antes de registrar miembros de junta necesitas contar con al menos una junta directiva creada.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <JuntaMiembrosFiltersCard
              juntas={juntaMiembros.juntas}
              onJuntaChange={juntaMiembros.handleJuntaChange}
              selectedJuntaId={juntaMiembros.selectedJuntaId}
            />

            {juntaMiembros.listError && (
              <Alert
                action={
                  <Button color="inherit" onClick={juntaMiembros.retryList} size="small">
                    Reintentar
                  </Button>
                }
                severity="error"
              >
                {juntaMiembros.listError}
              </Alert>
            )}

            {juntaMiembros.loadingRows ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <LinearProgress sx={{ borderRadius: 999 }} />
                </CardContent>
              </Card>
            ) : juntaMiembros.showEmptyState ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">No hay miembros registrados</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 480 }} variant="body2">
                    {juntaMiembros.selectedJunta
                      ? `La ${juntaMiembros.selectedJunta.nombre || 'junta seleccionada'} aun no tiene miembros registrados con los filtros actuales.`
                      : 'Selecciona una junta directiva para comenzar a registrar miembros.'}
                  </Typography>
                  <Button onClick={juntaMiembros.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                    Nuevo miembro
                  </Button>
                </CardContent>
              </Card>
            ) : juntaMiembros.isDesktop ? (
              <Card elevation={0}>
                <JuntaMiembrosTable
                  getPersonaLabel={(idPersona) => getPersonaLabelById(juntaMiembros.personaCache, idPersona)}
                  onDelete={juntaMiembros.openDeleteDialog}
                  onEdit={juntaMiembros.openEditDialog}
                  onView={juntaMiembros.openDetailDialog}
                  rows={juntaMiembros.rows}
                />
              </Card>
            ) : (
              <JuntaMiembrosMobileList
                getPersonaLabel={(idPersona) => getPersonaLabelById(juntaMiembros.personaCache, idPersona)}
                onDelete={juntaMiembros.openDeleteDialog}
                onEdit={juntaMiembros.openEditDialog}
                onView={juntaMiembros.openDetailDialog}
                rows={juntaMiembros.rows}
              />
            )}
          </>
        )}
      </Stack>

      {!juntaMiembros.isDesktop && juntaMiembros.hasJuntas && (
        <Fab
          color="primary"
          onClick={juntaMiembros.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {juntaMiembros.tenantId && juntaMiembros.hasJuntas && (
        <>
          <JuntaMiembroFormDialog
            checkingAvailability={juntaMiembros.checkingAvailability}
            defaultJuntaId={juntaMiembros.selectedJuntaId}
            hasEligiblePersonas={juntaMiembros.hasEligiblePersonas}
            initialPersonaOptions={juntaMiembros.formInitialPersonaOptions}
            juntaMiembro={juntaMiembros.formJuntaMiembro}
            juntas={juntaMiembros.juntas}
            loadError={juntaMiembros.formLoadError}
            loading={juntaMiembros.formLoading}
            mode={juntaMiembros.formMode}
            onClose={juntaMiembros.closeFormDialog}
            onPersonaChange={juntaMiembros.handlePersonaSelected}
            onSearchPersonas={juntaMiembros.searchPersonas}
            onSubmit={juntaMiembros.submitForm}
            open={juntaMiembros.formOpen}
            selectedPersona={juntaMiembros.formSelectedPersona}
            submitting={juntaMiembros.formSubmitting}
          />
          <JuntaMiembroDetailDialog
            error={juntaMiembros.detailError}
            juntaMiembro={juntaMiembros.detailJuntaMiembro}
            juntas={juntaMiembros.juntas}
            loading={juntaMiembros.detailLoading}
            onClose={juntaMiembros.closeDetailDialog}
            open={juntaMiembros.detailOpen}
            personaCache={juntaMiembros.personaCache}
          />
        </>
      )}

      <ConfirmDeleteJuntaMiembroDialog
        juntaMiembroLabel={juntaMiembros.deleteTargetLabel}
        loading={juntaMiembros.deleteLoading}
        onClose={juntaMiembros.closeDeleteDialog}
        onConfirm={() => {
          void juntaMiembros.confirmDelete();
        }}
        open={juntaMiembros.deleteDialogOpen}
      />

      <Toast
        message={juntaMiembros.toast.message}
        onClose={juntaMiembros.closeToast}
        open={juntaMiembros.toast.open}
        severity={juntaMiembros.toast.severity}
      />
    </Box>
  );
}
