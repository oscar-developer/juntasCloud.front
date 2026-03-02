import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type TenantSummary = {
  id: string;
  name: string;
  status: 'Activa' | 'Pendiente' | 'Suspendida';
};

type CreateTenantForm = {
  name: string;
  ruc: string;
  dni: string;
  observations: string;
};

const mockTenants: TenantSummary[] = [
  { id: 'villa-union', name: 'Junta Villa Unión', status: 'Activa' },
  { id: 'las-palmas', name: 'Junta Las Palmas', status: 'Pendiente' },
  { id: 'mirador-norte', name: 'Junta Mirador Norte', status: 'Suspendida' },
];

const initialForm: CreateTenantForm = {
  name: '',
  ruc: '',
  dni: '',
  observations: '',
};

function getStatusColor(status: TenantSummary['status']) {
  if (status === 'Activa') {
    return 'success';
  }

  if (status === 'Pendiente') {
    return 'warning';
  }

  return 'default';
}

export function TenantsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateTenantForm>(initialForm);
  const tenants = mockTenants;

  const isSubmitDisabled = !form.name.trim();

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm(initialForm);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    console.log({
      name: form.name.trim(),
      ruc: form.ruc.trim(),
      dni: form.dni.trim(),
      observations: form.observations.trim(),
    });

    handleCloseDialog();
  };

  return (
    <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 10, md: 2 } }}>
      <Stack
        alignItems={{ xs: 'flex-start', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Mis juntas</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body1">
            Administra tus accesos globales y entra a cada junta cuando lo necesites.
          </Typography>
        </Box>

        {isDesktop && (
          <Button onClick={() => setDialogOpen(true)} startIcon={<AddRoundedIcon />} variant="contained">
            Crear junta
          </Button>
        )}
      </Stack>

      {tenants.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Aún no tienes juntas</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Crea tu primera junta para comenzar a gestionar tus espacios.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {tenants.map((tenant) => (
            <Card elevation={0} key={tenant.id}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Stack
                    alignItems="flex-start"
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="h6">{tenant.name}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                        Acceso global disponible
                      </Typography>
                    </Box>
                    <Chip color={getStatusColor(tenant.status)} label={tenant.status} size="small" />
                  </Stack>

                  <Button
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate(`/t/${tenant.id}/dashboard`)}
                    variant="outlined"
                  >
                    Entrar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!isDesktop && (
        <Fab
          color="primary"
          onClick={() => setDialogOpen(true)}
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={handleCloseDialog}
        open={dialogOpen}
      >
        <DialogTitle>Crear junta</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                fullWidth
                label="Nombre"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                value={form.name}
              />
              <TextField
                fullWidth
                label="RUC"
                onChange={(event) => setForm((current) => ({ ...current, ruc: event.target.value }))}
                value={form.ruc}
              />
              <TextField
                fullWidth
                label="DNI"
                onChange={(event) => setForm((current) => ({ ...current, dni: event.target.value }))}
                value={form.dni}
              />
              <TextField
                fullWidth
                label="Observaciones"
                minRows={3}
                multiline
                onChange={(event) =>
                  setForm((current) => ({ ...current, observations: event.target.value }))
                }
                value={form.observations}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} variant="text">
              Cancelar
            </Button>
            <Button disabled={isSubmitDisabled} type="submit" variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
