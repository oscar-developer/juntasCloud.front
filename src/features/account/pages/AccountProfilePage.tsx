import { Card, CardContent, Typography } from '@mui/material';

export function AccountProfilePage() {
  return (
    <Card elevation={0} sx={{ mt: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Perfil</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Esta sección queda lista para gestionar tus datos personales y preferencias.
        </Typography>
      </CardContent>
    </Card>
  );
}
