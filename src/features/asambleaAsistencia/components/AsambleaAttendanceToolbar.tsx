import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
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
  const hasActiveToolbarValue = Boolean(searchInput.trim()) || statusFilter !== 'all';
  const filterOrder: AttendanceFilter[] = ['all', 'unknown', 'present', 'absent'];

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
      <CardContent sx={{ p: { xs: 1, sm: 2, md: 2.5 } }}>
        <Stack spacing={{ xs: 1, sm: 2 }}>
          <Stack direction={{ xs: 'row', sm: 'column', md: 'row' }} spacing={{ xs: 1, sm: 1.5 }}>
            <TextField
              fullWidth
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Buscar por nombre o DNI"
              value={searchInput}
              sx={(currentTheme) => ({
                [currentTheme.breakpoints.down('sm')]: {
                  '& .MuiOutlinedInput-root': {
                    minHeight: 44,
                  },
                  '& .MuiInputBase-input': {
                    py: 1.1,
                  },
                },
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              aria-label="Recargar"
              onClick={onReload}
              sx={{
                border: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                display: { xs: 'inline-flex', sm: 'none' },
                height: 44,
                width: 44,
              }}
            >
              <RefreshRoundedIcon />
            </IconButton>
            <Button
              onClick={onReload}
              startIcon={<RefreshRoundedIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              variant="outlined"
            >
              Recargar
            </Button>
            <Button
              onClick={onClear}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              variant="text"
            >
              Limpiar
            </Button>
          </Stack>

          <Box
            sx={{
              overflowX: 'auto',
              pb: { xs: 0.25, sm: 0 },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 0.75, sm: 1 }}
              sx={{ display: { xs: 'flex', sm: 'none' }, minWidth: 'max-content' }}
            >
              {filterOrder.map((filterValue) => {
                const selected = statusFilter === filterValue;

                return (
                  <Chip
                    color={selected ? 'primary' : 'default'}
                    key={filterValue}
                    label={`${getAttendanceFilterLabel(filterValue)} ${filterCounts[filterValue]}`}
                    onClick={() => onStatusFilterChange(filterValue)}
                    size="small"
                    sx={{
                      fontWeight: selected ? 700 : 600,
                      height: 30,
                    }}
                    variant={selected ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: 'max-content' }}
            >
              {filterOrder.map((filterValue) => (
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

          <Stack
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            direction={{ xs: 'row', sm: 'column' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Typography color="text.secondary" variant="caption">
              {filteredCount} visibles de {totalCount} personas activas.
            </Typography>
            <Button
              onClick={onClear}
              size="small"
              sx={{
                display: { xs: hasActiveToolbarValue ? 'inline-flex' : 'none', sm: 'none' },
                minHeight: 28,
                px: 1,
              }}
              variant="text"
            >
              Limpiar
            </Button>
          </Stack>

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
