import { Card, CardContent, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';

export function TenantDashboardPage() {
  const { tenantId } = useParams<{ tenantId: string }>();

  if (!tenantId) {
    return <Navigate replace to="/app/tenants" />;
  }

  return (
    <Card elevation={0} sx={{ m: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Dashboard de la junta</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Tenant actual: {tenantId}
        </Typography>
      </CardContent>
    </Card>
  );
}
