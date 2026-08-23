import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import type { PersonaFichaResumen, PersonaFichaSectionState } from '../types';
import {
  formatFichaDate,
  formatFichaMoney,
  formatFichaPercent,
  formatFichaTime,
  getAsistenciaStatusChipProps,
} from './personaFichaUi';

type PersonaFichaResumenSectionProps = {
  state: PersonaFichaSectionState<PersonaFichaResumen>;
  onRetry: () => void;
  onOpenInfoCompleta: () => void;
};

export function PersonaFichaResumenSection({
  state,
  onRetry,
  onOpenInfoCompleta,
}: PersonaFichaResumenSectionProps) {
  if (state.status === 'loading' || state.status === 'idle') {
    return <SectionLoading label="Cargando resumen de persona..." />;
  }

  if (state.status === 'error') {
    return <SectionError message={state.error} onRetry={onRetry} />;
  }

  if (!state.data) {
    return <Alert severity="info">No se encontró resumen para esta persona.</Alert>;
  }

  const resumen = state.data;

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        <MetricCard
          label="Deuda pendiente"
          tone="error"
          value={formatFichaMoney(resumen.resumenFinanciero.deudaPendienteTotal)}
        />
        <AttendanceMetricCard label="Faenas" resumen={resumen.resumenFaenas} />
        <AttendanceMetricCard label="Asambleas" resumen={resumen.resumenAsambleas} />
      </Box>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontWeight: 800 }}>Últimos eventos</Typography>
            <Button onClick={onOpenInfoCompleta} size="small" variant="text">
              Ver información completa
            </Button>
          </Stack>
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {resumen.ultimosEventos.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No se encontraron eventos recientes para esta persona.
              </Typography>
            ) : (
              resumen.ultimosEventos.map((evento) => (
                <Card key={`${evento.tipo}-${evento.idAsistencia}`} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography color="text.secondary" variant="caption">
                          {formatFichaDate(evento.fecha)} · {evento.tipo}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                          {evento.nombreEvento}
                        </Typography>
                        {evento.montoRelacionado !== null ? (
                          <Typography color="error.main" variant="caption">
                            Monto relacionado: {formatFichaMoney(evento.montoRelacionado)}
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack alignItems="flex-end" spacing={0.75}>
                        <Chip size="small" {...getAsistenciaStatusChipProps(evento.estadoAsistencia)} />
                        {formatFichaTime(evento.horaLlegada) ? (
                          <Typography color="text.secondary" variant="caption">
                            {formatFichaTime(evento.horaLlegada)}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'error' }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        <Typography sx={{ color: tone === 'error' ? 'error.main' : 'text.primary', fontSize: 26, fontWeight: 900 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function AttendanceMetricCard({
  label,
  resumen,
}: {
  label: string;
  resumen: PersonaFichaResumen['resumenFaenas'];
}) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 900 }}>
          {resumen.asistencias + resumen.tardanzas} / {resumen.total}
        </Typography>
        <LinearProgress
          color="success"
          value={Math.min(resumen.porcentajeAsistencia, 100)}
          variant="determinate"
          sx={{ borderRadius: 999, mt: 1 }}
        />
        <Typography color="text.secondary" variant="caption">
          {formatFichaPercent(resumen.porcentajeAsistencia)} asistencia · {resumen.faltas} faltas · {resumen.tardanzas} tardanzas
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionLoading({ label }: { label: string }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <CircularProgress size={18} />
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <Alert action={<Button color="inherit" onClick={onRetry} size="small">Reintentar</Button>} severity="error">
      {message ?? 'No se pudo cargar la información.'}
    </Alert>
  );
}
