import { Card, CardContent, Typography } from '@mui/material';

export function AccountSecurityPage() {
  return (
    <Card elevation={0} sx={{ mt: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Seguridad</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Esta sección queda preparada para credenciales, verificación y controles de acceso.
        </Typography>
      </CardContent>
    </Card>
  );
}
