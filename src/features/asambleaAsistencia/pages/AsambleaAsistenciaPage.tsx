import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AsambleaAttendanceDesktopTable } from '../components/AsambleaAttendanceDesktopTable';
import { AsambleaAttendanceHeader } from '../components/AsambleaAttendanceHeader';
import { AsambleaAttendanceMobileList } from '../components/AsambleaAttendanceMobileList';
import { AsambleaAttendanceToolbar } from '../components/AsambleaAttendanceToolbar';
import { useAsambleaAsistencia } from '../hooks/useAsambleaAsistencia';

export function AsambleaAsistenciaPage() {
  const asistencia = useAsambleaAsistencia();

  return (
    <Box sx={{ pb: { xs: 2, sm: 4, md: 0 } }}>
      <Stack spacing={{ xs: 1.25, sm: 3 }}>
        <AsambleaAttendanceHeader
          asambleas={asistencia.orderedAsambleas}
          asambleasLoading={asistencia.asambleasLoading}
          onSelectAsamblea={asistencia.handleSelectAsamblea}
          selectedAsamblea={asistencia.selectedAsamblea}
          selectedAsambleaId={asistencia.selectedAsambleaId}
          summary={asistencia.summary}
          tenantName={asistencia.tenant?.nombre}
        />

        {asistencia.showNoAsambleas ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay asambleas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Para registrar asistencia primero necesitas crear o programar una asamblea.
              </Typography>
              <Button component={RouterLink} sx={{ mt: 3 }} to={asistencia.asambleasPagePath} variant="contained">
                Ir a asambleas
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {asistencia.selectedAsamblea ? (
          <Box
            sx={{
              position: 'sticky',
              top: { xs: 4, sm: 8, md: 16 },
              zIndex: 2,
            }}
          >
            <AsambleaAttendanceToolbar
              attendanceLoading={asistencia.attendanceLoading}
              filteredCount={asistencia.filteredRows.length}
              filterCounts={asistencia.filterCounts}
              onClear={asistencia.handleClearToolbar}
              onReload={asistencia.handleReload}
              onSearchInputChange={asistencia.setSearchInput}
              onStatusFilterChange={asistencia.setStatusFilter}
              personasLoading={asistencia.personasLoading}
              personasProgress={asistencia.personasProgress}
              searchInput={asistencia.searchInput}
              statusFilter={asistencia.statusFilter}
              totalCount={asistencia.summary.total}
            />
          </Box>
        ) : null}

        {asistencia.asambleasError ? (
          <Alert
            action={
              <Button color="inherit" onClick={asistencia.handleReload} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {asistencia.asambleasError}
          </Alert>
        ) : null}

        {asistencia.personasError ? (
          <Alert
            action={
              <Button color="inherit" onClick={asistencia.handleReload} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {asistencia.personasError}
          </Alert>
        ) : null}

        {asistencia.attendanceError ? (
          <Alert
            action={
              <Button color="inherit" onClick={asistencia.handleReload} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {asistencia.attendanceError}
          </Alert>
        ) : null}

        {asistencia.showInitialDataLoading ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography color="text.secondary" variant="body2">
                Cargando padrón y asambleas...
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {asistencia.showNoPersonas ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay personas activas para registrar</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                El módulo de asistencia necesita personas activas en el padrón para poder operar.
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {asistencia.showNoResults ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay resultados para estos filtros</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Ajusta la búsqueda o vuelve a “Todos” para recuperar el padrón completo.
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {asistencia.selectedAsamblea && asistencia.filteredRows.length > 0 ? (
          asistencia.isDesktop ? (
            <Card elevation={0}>
              <AsambleaAttendanceDesktopTable
                disabled={asistencia.attendanceLoading}
                onSelectStatus={asistencia.handleSelectStatus}
                rows={asistencia.filteredRows}
              />
            </Card>
          ) : (
            <AsambleaAttendanceMobileList
              disabled={asistencia.attendanceLoading}
              onSelectStatus={asistencia.handleSelectStatus}
              rows={asistencia.filteredRows}
            />
          )
        ) : null}
      </Stack>
    </Box>
  );
}
