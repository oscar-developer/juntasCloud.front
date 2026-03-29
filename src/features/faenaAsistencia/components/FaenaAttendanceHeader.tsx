import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  formatFaenaDate,
  getFaenaEstadoChipProps,
  getFaenaMandatoryLabel,
  getFaenaMultaLabel,
  getFaenaScheduleLabel,
  getFaenaTipoChipProps,
} from '../../faenas/components/faenasUi';
import type { Faena } from '../../faenas/types';
import type { FaenaAttendanceSummaryVM } from '../types';

type FaenaAttendanceHeaderProps = {
  tenantName?: string | null;
  faenas: Faena[];
  faenasLoading: boolean;
  selectedFaenaId: string;
  selectedFaena: Faena | null;
  summary: FaenaAttendanceSummaryVM;
  onSelectFaena: (nextFaenaId: string) => void;
};

type SummaryMetricCardProps = {
  label: string;
  value: number;
  tone: 'default' | 'success' | 'error' | 'warning';
};

function getSummaryTone(tone: SummaryMetricCardProps['tone']) {
  if (tone === 'success') {
    return {
      backgroundColor: alpha('#15803d', 0.08),
      borderColor: alpha('#15803d', 0.2),
      color: 'success.main',
    };
  }

  if (tone === 'error') {
    return {
      backgroundColor: alpha('#dc2626', 0.08),
      borderColor: alpha('#dc2626', 0.2),
      color: 'error.main',
    };
  }

  if (tone === 'warning') {
    return {
      backgroundColor: alpha('#ca8a04', 0.08),
      borderColor: alpha('#ca8a04', 0.2),
      color: 'warning.main',
    };
  }

  return {
    backgroundColor: alpha('#0f172a', 0.04),
    borderColor: 'divider',
    color: 'text.primary',
  };
}

function SummaryMetricCard({ label, value, tone }: SummaryMetricCardProps) {
  const palette = getSummaryTone(tone);

  return (
    <Box
      sx={{
        border: 1,
        borderRadius: 3,
        p: 2,
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ color: palette.color, fontSize: 30, fontWeight: 800, lineHeight: 1.05 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function FaenaAttendanceHeader({
  tenantName,
  faenas,
  faenasLoading,
  selectedFaenaId,
  selectedFaena,
  summary,
  onSelectFaena,
}: FaenaAttendanceHeaderProps) {
  return (
    <Card
      elevation={0}
      sx={{
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(255,251,235,0.98) 34%, rgba(236,253,245,0.92) 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 3 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Chip
                label={tenantName ?? 'Junta activa'}
                sx={{
                  bgcolor: alpha('#d97706', 0.12),
                  color: 'warning.dark',
                  fontWeight: 700,
                  width: 'fit-content',
                }}
              />
              <Typography sx={{ fontSize: { xs: 30, md: 38 }, fontWeight: 900, lineHeight: 1.02, mt: 1.5 }}>
                Asistencia de faena
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 760 }}>
                Registro operativo por padrón para marcar asistencia de la faena activa con filtros,
                sincronización por URL y guardado rápido en desktop y móvil.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Faena activa"
              onChange={(event) => onSelectFaena(event.target.value)}
              select
              sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}
              value={selectedFaenaId}
            >
              {faenas.length === 0 ? (
                <MenuItem disabled value="">
                  {faenasLoading ? 'Cargando faenas...' : 'No hay faenas disponibles'}
                </MenuItem>
              ) : (
                faenas.map((faena) => (
                  <MenuItem key={faena.idFaena} value={String(faena.idFaena)}>
                    {formatFaenaDate(faena.fechaProgramada)} · {faena.descripcion || `Faena ${faena.idFaena}`}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Stack>

          {selectedFaena ? (
            <Stack spacing={2.25}>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <CalendarMonthRoundedIcon color="action" sx={{ fontSize: 18 }} />
                    <Typography color="text.secondary" variant="body2">
                      {formatFaenaDate(selectedFaena.fechaProgramada)} · {getFaenaScheduleLabel(selectedFaena)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 800, mt: 0.75 }}>
                    {selectedFaena.descripcion || 'Faena sin descripcion'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedFaena.lugar?.trim() || 'Lugar no registrado'}
                  </Typography>
                </Box>

                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                  <Chip size="small" variant="outlined" {...getFaenaTipoChipProps(selectedFaena.tipoFaena)} />
                  <Chip size="small" variant="outlined" {...getFaenaEstadoChipProps(selectedFaena.estado)} />
                  <Chip
                    color={selectedFaena.esObligatoria ? 'warning' : 'default'}
                    label={`Obligatoria: ${getFaenaMandatoryLabel(selectedFaena.esObligatoria)}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    color={selectedFaena.montoMultaBase ? 'error' : 'default'}
                    label={getFaenaMultaLabel(selectedFaena.montoMultaBase)}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
              >
                <SummaryMetricCard label="Total" tone="default" value={summary.total} />
                <SummaryMetricCard label="Presentes" tone="success" value={summary.present} />
                <SummaryMetricCard label="Ausentes" tone="error" value={summary.absent} />
                <SummaryMetricCard label="Pendientes" tone="warning" value={summary.pending} />
              </Box>
            </Stack>
          ) : faenasLoading ? (
            <LinearProgress sx={{ borderRadius: 999 }} />
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
