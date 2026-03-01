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
          borderRadius: 5,
          p: { xs: 0.5, md: 1 },
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.96) 55%, rgba(51, 65, 85, 0.94) 100%)',
          color: '#f8fafc',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <Chip
              label="Resumen ejecutivo"
              sx={{
                alignSelf: 'flex-start',
                color: '#e2e8f0',
                bgcolor: 'rgba(148, 163, 184, 0.14)',
                borderRadius: 2,
              }}
            />
            <Box>
              <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800, lineHeight: 1.1 }}>
                Bienvenido, {user?.nombres ?? 'Usuario'}
              </Typography>
              <Typography sx={{ color: 'rgba(226, 232, 240, 0.78)', mt: 1.25, maxWidth: 620 }}>
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
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 180,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: 42, fontWeight: 800, my: 1.5 }}>{card.value}</Typography>
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
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Panel central</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25 }}>
              Esta primera etapa deja lista la base del sistema: autenticación, layout responsive y
              secciones iniciales para escalar módulos funcionales sin rehacer la estructura.
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Siguientes acciones</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {timeline.map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(148, 163, 184, 0.08)',
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
