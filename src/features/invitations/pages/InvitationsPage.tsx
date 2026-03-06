import { Card, CardContent, Typography } from '@mui/material';

export function InvitationsPage() {
  return (
    <Card elevation={0} sx={{ mt: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Invitaciones</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Aquí verás las invitaciones pendientes a nuevas juntas y espacios compartidos.
        </Typography>
      </CardContent>
    </Card>
  );
}
