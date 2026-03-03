import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { UpcomingEvent } from '../types';

type UpcomingEventsCardProps = {
  nextFaena: UpcomingEvent | null;
  nextAsamblea: UpcomingEvent | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return 'Sin fecha programada';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function EventRow({ label, event }: { label: string; event: UpcomingEvent | null }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#F8FAFC', 0.9),
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.75, fontWeight: 700 }}>
        {event?.title ?? 'Sin evento próximo'}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
        {formatDate(event?.scheduledAt ?? null)}
      </Typography>
    </Box>
  );
}

export function UpcomingEventsCard({ nextFaena, nextAsamblea }: UpcomingEventsCardProps) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Typography color="text.secondary" sx={{ fontWeight: 700 }} variant="body2">
              Próximos eventos
            </Typography>
            <EventAvailableRoundedIcon color="primary" fontSize="small" />
          </Stack>
          <EventRow event={nextFaena} label="Próxima faena" />
          <EventRow event={nextAsamblea} label="Próxima asamblea" />
        </Stack>
      </CardContent>
    </Card>
  );
}
