import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTenant } from '../context/TenantContext';

type TenantModulePageShellProps = {
  title: string;
  description: string;
};

export function TenantModulePageShell({ title, description }: TenantModulePageShellProps) {
  const { tenant } = useTenant();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800, lineHeight: 1.05 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          {description}
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.96) 55%, rgba(243,244,246,0.9) 100%)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            <Chip
              label={tenant?.nombre ?? 'Junta'}
              sx={{
                width: 'fit-content',
                fontWeight: 700,
                bgcolor: alpha('#EB7A3C', 0.1),
              }}
            />
            <Typography variant="h5">Módulo en preparación</Typography>
            <Typography color="text.secondary" variant="body2">
              La estructura del módulo ya está disponible dentro del tenant. Aquí podrás conectar
              formularios, tablas y servicios reales sin tocar el layout ni las rutas.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
