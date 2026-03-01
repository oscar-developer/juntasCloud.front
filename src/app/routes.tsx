import { Box, Card, CardContent, Typography } from '@mui/material';
import { Navigate, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AppLayout } from '../layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box sx={{ pt: { xs: 2, md: 3 } }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Esta sección queda preparada como placeholder para la siguiente etapa del proyecto.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export function AppRoutes() {
  return useRoutes([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              index: true,
              element: <DashboardPage />,
            },
            {
              path: 'juntas',
              element: <PlaceholderPage title="Juntas" />,
            },
            {
              path: 'personas',
              element: <PlaceholderPage title="Personas" />,
            },
            {
              path: 'terrenos',
              element: <PlaceholderPage title="Terrenos" />,
            },
            {
              path: 'configuracion',
              element: <PlaceholderPage title="Configuración" />,
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate replace to="/" />,
    },
  ]);
}
