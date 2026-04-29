import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmDeleteTenantProfileDialog } from '../components/ConfirmDeleteTenantProfileDialog';
import { TenantProfileFormDialog } from '../components/TenantProfileFormDialog';
import { TenantProfileMobileCard } from '../components/TenantProfileMobileCard';
import { TenantProfileModulesDialog } from '../components/TenantProfileModulesDialog';
import { TenantProfilesTable } from '../components/TenantProfilesTable';
import { useTenantProfiles } from '../hooks/useTenantProfiles';
import type { TenantProfileStatusFilter } from '../types/tenantProfiles.types';

export function TenantProfilesPage() {
  const profiles = useTenantProfiles();
  const showLoadingState = profiles.tenantLoading || profiles.initialLoading;

  return (
    <Box sx={{ pb: { xs: 10, md: 0 } }}>
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderColor: 'divider',
            background:
              'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 52%, rgba(243,244,246,0.9) 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 3 } }}>
            <Stack
              alignItems={{ xs: 'stretch', md: 'center' }}
              direction={{ xs: 'column', md: 'row' }}
              gap={{ xs: 2, md: 3 }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}>
                  Perfiles / Roles
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }} variant="body1">
                  Administra los perfiles y permisos de acceso del tenant.
                </Typography>
                {showLoadingState && (
                  <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />
                )}
              </Box>

              {profiles.isAdmin && profiles.isDesktop && (
                <Box sx={{ flexShrink: 0 }}>
                  <Button
                    onClick={profiles.openCreateDialog}
                    startIcon={<AddRoundedIcon />}
                    variant="contained"
                  >
                    Nuevo perfil
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {!profiles.tenantLoading && !profiles.isAdmin ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Alert severity="warning">No tienes permisos para administrar perfiles en esta junta.</Alert>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card elevation={0}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={1.5}>
                  {profiles.isDesktop && (
                    <Typography color="text.secondary" variant="caption">
                      Busca por nombre o descripción y filtra por estado.
                    </Typography>
                  )}

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Buscar"
                      onChange={(event) => profiles.setSearchInput(event.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      value={profiles.searchInput}
                    />
                    <TextField
                      fullWidth
                      label="Estado"
                      onChange={(event) =>
                        profiles.setEstadoFilter(event.target.value as TenantProfileStatusFilter)
                      }
                      select
                      sx={{ minWidth: { md: 190 } }}
                      value={profiles.estadoFilter}
                    >
                      <MenuItem value="TODOS">Todos</MenuItem>
                      <MenuItem value="ACTIVOS">Activos</MenuItem>
                      <MenuItem value="INACTIVOS">Inactivos</MenuItem>
                    </TextField>
                    {profiles.isDesktop && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button onClick={profiles.clearFilters} variant="text">
                          Limpiar
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {profiles.error && (
              <Alert
                action={
                  <Button color="inherit" onClick={profiles.retry} size="small">
                    Reintentar
                  </Button>
                }
                severity="error"
              >
                {profiles.error}
              </Alert>
            )}

            {showLoadingState ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <LinearProgress sx={{ borderRadius: 999 }} />
                </CardContent>
              </Card>
            ) : profiles.showEmptyState ? (
              <Card elevation={0}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">No hay perfiles registrados</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, mx: 'auto', maxWidth: 460 }}
                    variant="body2"
                  >
                    Crea el primer perfil para comenzar a organizar permisos por rol.
                  </Typography>
                  <Button onClick={profiles.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                    Nuevo perfil
                  </Button>
                </CardContent>
              </Card>
            ) : profiles.isDesktop ? (
              <Card elevation={0}>
                <TenantProfilesTable
                  hasMore={profiles.hasMore}
                  loadingMore={profiles.loadingMore}
                  onConfigureModules={profiles.openModulesDialog}
                  onDelete={profiles.openDeleteDialog}
                  onEdit={profiles.openEditDialog}
                  onReachEnd={profiles.handleReachEnd}
                  rows={profiles.rows}
                />
              </Card>
            ) : (
              <TenantProfileMobileCard
                hasMore={profiles.hasMore}
                loadingMore={profiles.loadingMore}
                onConfigureModules={profiles.openModulesDialog}
                onDelete={profiles.openDeleteDialog}
                onEdit={profiles.openEditDialog}
                onReachEnd={profiles.handleReachEnd}
                rows={profiles.rows}
                total={profiles.total}
              />
            )}
          </>
        )}
      </Stack>

      {!profiles.isDesktop && profiles.isAdmin && (
        <Fab
          color="primary"
          onClick={profiles.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      {profiles.tenantId && (
        <>
          <TenantProfileFormDialog
            loadError={profiles.formLoadError}
            loading={profiles.formLoading}
            mode={profiles.formMode}
            onClose={profiles.closeFormDialog}
            onSubmit={profiles.submitForm}
            open={profiles.formOpen}
            profile={profiles.formProfile}
            submitting={profiles.formSubmitting}
          />

          <TenantProfileModulesDialog
            onClose={profiles.closeModulesDialog}
            onSaved={profiles.handleModulesSaved}
            onShowMessage={profiles.showMessage}
            open={profiles.modulesDialogOpen}
            profile={profiles.modulesProfile}
            tenantId={profiles.tenantId}
          />
        </>
      )}

      <ConfirmDeleteTenantProfileDialog
        loading={profiles.deleteLoading}
        onClose={profiles.closeDeleteDialog}
        onConfirm={() => {
          void profiles.confirmDelete();
        }}
        open={profiles.deleteDialogOpen}
        profileName={profiles.deleteTargetName}
      />

      <Toast
        message={profiles.toast.message}
        onClose={profiles.closeToast}
        open={profiles.toast.open}
        severity={profiles.toast.severity}
      />
    </Box>
  );
}
