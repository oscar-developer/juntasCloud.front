import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useAuth } from '../auth/useAuth';

const summaryCards = [
  {
    title: 'Juntas próximas',
    value: '04',
    detail: 'Reuniones programadas en los próximos 30 días',
  },
  {
    title: 'Personas activas',
    value: '128',
    detail: 'Miembros y responsables con acceso vigente',
  },
  {
    title: 'Terrenos monitoreados',
    value: '19',
    detail: 'Unidades con seguimiento documental actualizado',
  },
];

const timeline = [
  'Revisar agenda y documentación de la siguiente junta.',
  'Actualizar responsables en seguimiento de acuerdos.',
  'Validar estado de expedientes pendientes.',
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack spacing={3} sx={{ pt: { xs: 2, md: 3 } }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          p: { xs: 0.5, md: 1 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <Chip
              label="Resumen ejecutivo"
              variant="filled"
              sx={{
                alignSelf: 'flex-start',
                color: 'text.primary',
                bgcolor: 'action.hover',
                borderRadius: 2,
              }}
            />
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, lineHeight: 1.1, typography: { xs: 'h5', md: 'h4' } }}
              >
                Bienvenido, {user?.nombres ?? 'Usuario'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 620 }} variant="body1">
                Mantén visibilidad clara sobre juntas, participantes y seguimiento con una interfaz
                enfocada en decisiones y trazabilidad.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {summaryCards.map((card) => (
          <Card
            elevation={0}
            key={card.title}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 180,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">
                {card.title}
              </Typography>
              <Typography sx={{ fontWeight: 800, my: 1.5, typography: { xs: 'h4', md: 'h3' } }}>
                {card.value}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {card.detail}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1.6fr 1fr' },
          gap: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6">Panel central</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25 }} variant="body1">
              Esta primera etapa deja lista la base del sistema: autenticación, layout responsive y
              secciones iniciales para escalar módulos funcionales sin rehacer la estructura.
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6">Siguientes acciones</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {timeline.map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
