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
  formatAsambleaDate,
  formatAsambleaTime,
  getAsambleaConvocatoriaChipProps,
  getAsambleaEstadoChipProps,
  getAsambleaTipoChipProps,
} from '../../asambleas/components/asambleasUi';
import type { Asamblea } from '../../asambleas/types';
import type { AttendanceSummaryVM } from '../types';

type AsambleaAttendanceHeaderProps = {
  tenantName?: string | null;
  asambleas: Asamblea[];
  asambleasLoading: boolean;
  selectedAsambleaId: string;
  selectedAsamblea: Asamblea | null;
  summary: AttendanceSummaryVM;
  onSelectAsamblea: (nextAsambleaId: string) => void;
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
        p: { xs: 1, sm: 2 },
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
        textAlign: { xs: 'center', sm: 'left' },
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: { xs: 11, sm: 14 } }} variant="body2">
        {label}
      </Typography>
      <Typography sx={{ color: palette.color, fontSize: { xs: 22, sm: 30 }, fontWeight: 800, lineHeight: 1.05 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function AsambleaAttendanceHeader({
  tenantName,
  asambleas,
  asambleasLoading,
  selectedAsambleaId,
  selectedAsamblea,
  summary,
  onSelectAsamblea,
}: AsambleaAttendanceHeaderProps) {
  return (
    <Card
      elevation={0}
      sx={{
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(249,250,251,0.98) 38%, rgba(236,253,245,0.92) 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3.5 } }}>
        <Stack spacing={{ xs: 1.5, sm: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={{ xs: 1.25, sm: 2, md: 3 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Chip
                label={tenantName ?? 'Junta activa'}
                size="small"
                sx={{
                  bgcolor: alpha('#059669', 0.12),
                  color: 'success.dark',
                  fontWeight: 700,
                  width: 'fit-content',
                }}
              />
              <Typography sx={{ fontSize: { xs: 24, sm: 30, md: 38 }, fontWeight: 900, lineHeight: 1.05, mt: { xs: 1, sm: 1.5 } }}>
                Registro de asistencia
              </Typography>
              <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, mt: 1.25, maxWidth: 760 }}>
                Módulo operativo para marcar asistencia de asamblea con registro rápido, filtros por estado
                y virtualización tanto en desktop como en móvil.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Asamblea activa"
              onChange={(event) => onSelectAsamblea(event.target.value)}
              select
              sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}
              value={selectedAsambleaId}
            >
              {asambleas.length === 0 ? (
                <MenuItem disabled value="">
                  {asambleasLoading ? 'Cargando asambleas...' : 'No hay asambleas disponibles'}
                </MenuItem>
              ) : (
                asambleas.map((asamblea) => (
                  <MenuItem key={asamblea.idAsamblea} value={String(asamblea.idAsamblea)}>
                    {formatAsambleaDate(asamblea.fechaProgramada)} ·{' '}
                    {asamblea.temaPrincipal || `Asamblea ${asamblea.idAsamblea}`}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Stack>

          {selectedAsamblea ? (
            <Stack spacing={{ xs: 1.25, sm: 2.25 }}>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={{ xs: 1, sm: 1.5 }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <CalendarMonthRoundedIcon color="action" sx={{ fontSize: 18 }} />
                    <Typography color="text.secondary" variant="body2">
                      {formatAsambleaDate(selectedAsamblea.fechaProgramada)} ·{' '}
                      {formatAsambleaTime(selectedAsamblea.horaInicioReal)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: { xs: 18, sm: 24, md: 28 }, fontWeight: 800, mt: { xs: 0.35, sm: 0.75 } }}>
                    {selectedAsamblea.temaPrincipal || 'Asamblea sin tema'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: 13, sm: 16 }, mt: { xs: 0.25, sm: 0.5 } }}>
                    {selectedAsamblea.lugar?.trim() || 'Lugar no registrado'}
                  </Typography>
                </Box>

                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                  <Chip size="small" variant="outlined" {...getAsambleaTipoChipProps(selectedAsamblea.tipo)} />
                  <Chip
                    size="small"
                    variant="outlined"
                    {...getAsambleaConvocatoriaChipProps(selectedAsamblea.convocatoria)}
                  />
                  <Chip size="small" variant="outlined" {...getAsambleaEstadoChipProps(selectedAsamblea.estado)} />
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                  '@media (min-width:450px) and (max-width:599.95px)': {
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: { xs: 0.75, sm: 1.5 },
                }}
              >
                <SummaryMetricCard label="Total" tone="default" value={summary.total} />
                <SummaryMetricCard label="Presentes" tone="success" value={summary.present} />
                <SummaryMetricCard label="Ausentes" tone="error" value={summary.absent} />
                <SummaryMetricCard label="Pendientes" tone="warning" value={summary.pending} />
              </Box>
            </Stack>
          ) : asambleasLoading ? (
            <LinearProgress sx={{ borderRadius: 999 }} />
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
