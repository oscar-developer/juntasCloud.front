import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Toast } from '../../../shared/ui/Toast';
import { ConfirmPermanentDeleteDialog } from '../components/ConfirmPermanentDeleteDialog';
import { TrashTenantCard } from '../components/TrashTenantCard';
import { useTenantTrash } from '../hooks/useTenantTrash';

export function TenantTrashPage() {
  const trash = useTenantTrash();

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
                    <Stack alignItems="center" direction="row" spacing={1.25}>
                      <DeleteSweepRoundedIcon color="primary" />
                      <Typography
                        sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 800, lineHeight: 1.05 }}
                      >
                        Papelera
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }} variant="body1">
                      Juntas enviadas a papelera. Aquí puedes revisar registros inactivos y
                      eliminarlos permanentemente.
                    </Typography>
                    {trash.loading && <LinearProgress sx={{ mt: 2.5, borderRadius: 999, maxWidth: 320 }} />}
                  </Box>

                  {trash.isDesktop && (
                    <Box sx={{ flexShrink: 0, minWidth: 0 }}>
                      <Button
                        component={RouterLink}
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{ minWidth: 150 }}
                        to="/app/juntas"
                        variant="outlined"
                      >
                        Mis juntas
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              La restauración está preparada en la interfaz, pero falta exponer el endpoint de
              restauración en el backend.
            </Alert>
          </Grid>

          {trash.error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{trash.error}</Alert>
            </Grid>
          )}

          {trash.showEmptyState ? (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ maxWidth: 760, mx: 'auto' }}>
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Typography variant="h5">No hay juntas en papelera</Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, mx: 'auto', maxWidth: 440 }}
                    variant="body2"
                  >
                    Las juntas enviadas a papelera aparecerán aquí antes de una eliminación
                    definitiva.
                  </Typography>
                  <Button
                    component={RouterLink}
                    startIcon={<ArrowBackRoundedIcon />}
                    sx={{ mt: 3 }}
                    to="/app/juntas"
                    variant="contained"
                  >
                    Volver a mis juntas
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            trash.tenants.map((tenant) => (
              <Grid key={tenant.idTenant} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
                <TrashTenantCard
                  isDeleting={
                    trash.deleteLoadingId !== null &&
                    String(trash.deleteLoadingId) === String(tenant.idTenant)
                  }
                  onDeletePermanent={() => trash.requestPermanentDelete(tenant)}
                  tenant={tenant}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      <ConfirmPermanentDeleteDialog
        loading={
          trash.deleteTarget !== null &&
          trash.deleteLoadingId !== null &&
          String(trash.deleteTarget.idTenant) === String(trash.deleteLoadingId)
        }
        onClose={trash.closePermanentDeleteDialog}
        onConfirm={() => {
          void trash.confirmPermanentDelete();
        }}
        open={Boolean(trash.deleteTarget)}
        tenantName={trash.deleteTarget?.nombre}
      />

      <Toast
        message={trash.toast.message}
        onClose={trash.closeToast}
        open={trash.toast.open}
        severity={trash.toast.severity}
      />
    </Box>
  );
}
