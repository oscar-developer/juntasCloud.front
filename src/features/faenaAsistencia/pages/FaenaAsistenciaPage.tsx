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
import { FaenaAttendanceDesktopTable } from '../components/FaenaAttendanceDesktopTable';
import { FaenaAttendanceHeader } from '../components/FaenaAttendanceHeader';
import { FaenaAttendanceMobileList } from '../components/FaenaAttendanceMobileList';
import { FaenaAttendanceToolbar } from '../components/FaenaAttendanceToolbar';
import { useFaenaAsistencia } from '../hooks/useFaenaAsistencia';

export function FaenaAsistenciaPage() {
  const asistencia = useFaenaAsistencia();

  return (
    <Box sx={{ pb: { xs: 4, md: 0 } }}>
      <Stack spacing={3}>
        <FaenaAttendanceHeader
          faenas={asistencia.orderedFaenas}
          faenasLoading={asistencia.faenasLoading}
          onSelectFaena={asistencia.handleSelectFaena}
          selectedFaena={asistencia.selectedFaena}
          selectedFaenaId={asistencia.selectedFaenaId}
          summary={asistencia.summary}
          tenantName={asistencia.tenant?.nombre}
        />

        {asistencia.showNoFaenas ? (
          <Card elevation={0}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Typography variant="h5">No hay faenas registradas</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mx: 'auto', maxWidth: 460 }} variant="body2">
                Para registrar asistencia primero necesitas crear o programar una faena.
              </Typography>
              <Button component={RouterLink} sx={{ mt: 3 }} to={asistencia.faenasPagePath} variant="contained">
                Ir a faenas
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {asistencia.selectedFaena ? (
          <Box
            sx={{
              position: 'sticky',
              top: { xs: 8, md: 16 },
              zIndex: 2,
            }}
          >
            <FaenaAttendanceToolbar
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

        {asistencia.faenasError ? (
          <Alert
            action={
              <Button color="inherit" onClick={asistencia.handleReload} size="small">
                Reintentar
              </Button>
            }
            severity="error"
          >
            {asistencia.faenasError}
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
                Cargando padrón y faenas...
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

        {asistencia.selectedFaena && asistencia.filteredRows.length > 0 ? (
          asistencia.isDesktop ? (
            <Card elevation={0}>
              <FaenaAttendanceDesktopTable
                disabled={asistencia.attendanceLoading}
                onSelectStatus={asistencia.handleSelectStatus}
                rows={asistencia.filteredRows}
              />
            </Card>
          ) : (
            <FaenaAttendanceMobileList
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
