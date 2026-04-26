import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fab,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { TenantCard } from '../components/TenantCard';
import { TenantFormDialog } from '../components/TenantFormDialog';
import { useJuntas } from '../hooks/useJuntas';

export function TenantsPage() {
  const juntas = useJuntas();

  return (
    <Box sx={{ pt: { xs: 2, md: 0 }, pb: { xs: 10, md: 0 } }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
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
                  justifyContent="space-between"
                  gap={{ xs: 2, md: 3 }}
                >
                  <Box sx={{ width: '100%', minWidth: 0, maxWidth: { md: 820 } }}>
                    <Typography sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}>
                      Mis juntas
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }} variant="body1">
                      Administra tus accesos globales.
                    </Typography>
                    {juntas.loading && <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />}
                  </Box>

                  {juntas.isDesktop && (
                    <Box sx={{ flexShrink: 0, minWidth: 0 }}>
                      <Button
                        onClick={juntas.openCreateDialog}
                        startIcon={<AddRoundedIcon />}
                        sx={{ minWidth: 168 }}
                        variant="contained"
                      >
                        Crear junta
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {juntas.error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{juntas.error}</Alert>
            </Grid>
          )}

          {juntas.showEmptyState ? (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ maxWidth: 760, mx: 'auto' }}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">Aún no tienes juntas</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, mx: 'auto', maxWidth: 420 }}
                    variant="body2"
                  >
                    Crea tu primera junta para comenzar a gestionar tus espacios.
                  </Typography>
                  <Button onClick={juntas.openCreateDialog} sx={{ mt: 3 }} variant="contained">
                    Crear junta
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            juntas.tenants.map((tenant) => (
              <Grid key={tenant.idTenant} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
                <TenantCard
                  isDeleting={
                    juntas.deleteLoadingId !== null &&
                    String(juntas.deleteLoadingId) === String(tenant.idTenant)
                  }
                  isOwner={juntas.isTenantOwner(tenant)}
                  onDelete={() => juntas.requestDelete(tenant)}
                  onEdit={() => juntas.editTenant(tenant)}
                  onEnter={() => juntas.enterTenant(tenant)}
                  tenant={tenant}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {!juntas.isDesktop && (
        <Fab
          color="primary"
          onClick={juntas.openCreateDialog}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      <TenantFormDialog
        initialValues={juntas.editingTenant ?? undefined}
        mode={juntas.editingTenant ? 'edit' : 'create'}
        onClose={juntas.closeDialog}
        onSubmit={juntas.submitTenant}
        open={juntas.dialogOpen}
        submitting={juntas.submitting}
      />

      <ConfirmDeleteDialog
        loading={
          juntas.deleteTarget !== null &&
          juntas.deleteLoadingId !== null &&
          String(juntas.deleteTarget.idTenant) === String(juntas.deleteLoadingId)
        }
        onClose={juntas.closeDeleteDialog}
        onConfirm={() => {
          void juntas.confirmDelete();
        }}
        open={Boolean(juntas.deleteTarget)}
        tenantName={juntas.deleteTarget?.nombre}
      />

      <Toast
        message={juntas.toast.message}
        onClose={juntas.closeToast}
        open={juntas.toast.open}
        severity={juntas.toast.severity}
      />
    </Box>
  );
}
