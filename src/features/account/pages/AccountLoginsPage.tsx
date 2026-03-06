import { Card, CardContent, Typography } from '@mui/material';

export function AccountLoginsPage() {
  return (
    <Card elevation={0} sx={{ mt: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Historial de accesos</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Aquí podrás revisar tus sesiones recientes y actividad de acceso.
        </Typography>
      </CardContent>
    </Card>
  );
}
