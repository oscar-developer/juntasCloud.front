import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Box, Button, Card, CardContent, Fab, LinearProgress, Stack, Typography } from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmRetireDialog } from '../components/ConfirmRetireDialog';
import { ExportPersonasDialog } from '../components/ExportPersonasDialog';
import { PersonaDetailDialog } from '../components/PersonaDetailDialog';
import { PersonaFiltersCard } from '../components/PersonaFiltersCard';
import { PersonaFormDialog } from '../components/PersonaFormDialog';
import { PersonaMobileList } from '../components/PersonaMobileList';
import { PersonaTable } from '../components/PersonaTable';
import { usePersonasPage } from '../hooks/usePersonasPage';

export function PersonasPage() {
  const personasPage = usePersonasPage();

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        {personasPage.isDesktop && (
          <Stack direction="row" justifyContent="flex-end">
            <Button
              onClick={personasPage.openCreateDialog}
              startIcon={<AddRoundedIcon />}
              variant="contained"
            >
              Nueva persona
            </Button>
          </Stack>
        )}

        <PersonaFiltersCard
          dniValue={personasPage.dniFilter}
          exportLoading={personasPage.exportLoading}
          estadoValue={personasPage.estadoFilter}
          isDesktop={personasPage.isDesktop}
          onClear={personasPage.clearFilters}
          onDniChange={personasPage.setDniFilter}
          onEstadoChange={personasPage.setEstadoFilter}
          onExportClick={personasPage.openExportDialog}
          onSearchChange={personasPage.setSearchInput}
          onTipoChange={personasPage.setTipoParticipanteFilter}
          searchValue={personasPage.searchInput}
          tipoValue={personasPage.tipoParticipanteFilter}
        />

        {personasPage.error && (
          <Alert
            action={
              <Button color="inherit" onClick={personasPage.retry} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {personasPage.error}
          </Alert>
        )}

        {personasPage.initialLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <LinearProgress sx={{ borderRadius: 999 }} />
            </CardContent>
          </Card>
        ) : personasPage.showEmptyState ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay personas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 420 }} variant="body2">
                Ajusta la búsqueda o crea una nueva persona para comenzar a poblar el padrón.
              </Typography>
              <Button onClick={personasPage.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                Nueva persona
              </Button>
            </CardContent>
          </Card>
        ) : personasPage.isDesktop ? (
          <Card elevation={0}>
            <PersonaTable
              hasMore={personasPage.hasMore}
              loadingMore={personasPage.loadingMore}
              onEdit={personasPage.openEditDialog}
              onReachEnd={personasPage.handleReachEnd}
              onRetire={personasPage.openRetireDialog}
              onView={personasPage.openDetailDialog}
              rows={personasPage.rows}
            />
          </Card>
        ) : (
          <PersonaMobileList
            hasMore={personasPage.hasMore}
            loadingMore={personasPage.loadingMore}
            onEdit={personasPage.openEditDialog}
            onReachEnd={personasPage.handleReachEnd}
            onRetire={personasPage.openRetireDialog}
            onView={personasPage.openDetailDialog}
            rows={personasPage.rows}
            total={personasPage.total}
          />
        )}
      </Stack>

      {!personasPage.isDesktop && (
        <Fab
          color="primary"
          onClick={personasPage.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {personasPage.tenantId && (
        <>
          <ExportPersonasDialog
            loading={personasPage.exportLoading}
            onClose={personasPage.closeExportDialog}
            onExportExcel={() => {
              void personasPage.handleExport('excel');
            }}
            onExportPdf={() => {
              void personasPage.handleExport('pdf');
            }}
            open={personasPage.exportOpen}
          />
          <PersonaFormDialog
            mode={personasPage.formMode}
            onClose={personasPage.closeFormDialog}
            onSaved={personasPage.handleSaved}
            onShowMessage={personasPage.showMessage}
            open={personasPage.formOpen}
            personaId={personasPage.editingPersonaId}
            tenantId={personasPage.tenantId}
          />
          <PersonaDetailDialog
            onClose={personasPage.closeDetailDialog}
            open={personasPage.detailOpen}
            personaId={personasPage.detailPersonaId}
            tenantId={personasPage.tenantId}
          />
        </>
      )}

      <ConfirmRetireDialog
        loading={personasPage.retireLoading}
        onClose={personasPage.closeRetireDialog}
        onConfirm={() => {
          void personasPage.confirmRetire();
        }}
        open={personasPage.retireDialogOpen}
        personaName={personasPage.retireTargetName}
      />

      <Toast
        message={personasPage.toast.message}
        onClose={personasPage.closeToast}
        open={personasPage.toast.open}
        severity={personasPage.toast.severity}
      />
    </Box>
  );
}
