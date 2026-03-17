import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { getAttendanceFilterLabel } from './asambleaAttendanceUi';
import type { AttendanceFilter } from '../types';

type AsambleaAttendanceToolbarProps = {
  searchInput: string;
  statusFilter: AttendanceFilter;
  filterCounts: Record<AttendanceFilter, number>;
  filteredCount: number;
  totalCount: number;
  personasLoading: boolean;
  personasProgress: { loaded: number; total: number };
  attendanceLoading: boolean;
  onSearchInputChange: (value: string) => void;
  onReload: () => void;
  onClear: () => void;
  onStatusFilterChange: (filter: AttendanceFilter) => void;
};

export function AsambleaAttendanceToolbar({
  searchInput,
  statusFilter,
  filterCounts,
  filteredCount,
  totalCount,
  personasLoading,
  personasProgress,
  attendanceLoading,
  onSearchInputChange,
  onReload,
  onClear,
  onStatusFilterChange,
}: AsambleaAttendanceToolbarProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Buscar por nombre, DNI o correo"
              value={searchInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={onReload} startIcon={<RefreshRoundedIcon />} variant="outlined">
              Recargar
            </Button>
            <Button onClick={onClear} variant="text">
              Limpiar
            </Button>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
              {(['all', 'unknown', 'present', 'absent'] as AttendanceFilter[]).map((filterValue) => (
                <Button
                  key={filterValue}
                  onClick={() => onStatusFilterChange(filterValue)}
                  size="small"
                  variant={statusFilter === filterValue ? 'contained' : 'outlined'}
                >
                  {getAttendanceFilterLabel(filterValue)} ({filterCounts[filterValue]})
                </Button>
              ))}
            </Stack>
          </Box>

          <Typography color="text.secondary" variant="caption">
            {filteredCount} visibles de {totalCount} personas activas.
          </Typography>

          {personasLoading ? (
            <Stack spacing={0.75}>
              <LinearProgress sx={{ borderRadius: 999 }} />
              <Typography color="text.secondary" variant="caption">
                Sincronizando padrón: {personasProgress.loaded} / {personasProgress.total || '...'}
              </Typography>
            </Stack>
          ) : null}

          {attendanceLoading ? (
            <Stack spacing={0.75}>
              <LinearProgress sx={{ borderRadius: 999 }} />
              <Typography color="text.secondary" variant="caption">
                Actualizando asistencias de la asamblea seleccionada...
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
