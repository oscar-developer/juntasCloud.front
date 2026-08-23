import { Box, Stack } from '@mui/material';
import { PersonaFichaAsistenciaSection } from '../components/PersonaFichaAsistenciaSection';
import { PersonaFichaHeader } from '../components/PersonaFichaHeader';
import { PersonaFichaInfoCompletaDialog } from '../components/PersonaFichaInfoCompletaDialog';
import { PersonaFichaNavigation } from '../components/PersonaFichaNavigation';
import { PersonaFichaObligacionesSection } from '../components/PersonaFichaObligacionesSection';
import { PersonaFichaPagosSection } from '../components/PersonaFichaPagosSection';
import { PersonaFichaResumenSection } from '../components/PersonaFichaResumenSection';
import { PersonaFichaTerrenosSection } from '../components/PersonaFichaTerrenosSection';
import { usePersonaFichaPage } from '../hooks/usePersonaFichaPage';

export function PersonaFichaPage() {
  const ficha = usePersonaFichaPage();

  return (
    <Box sx={{ pb: { xs: 3, md: 0 } }}>
      <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
        <PersonaFichaHeader
          onBack={ficha.goBackToPersonas}
          resumen={ficha.resumenState.data}
        />

        <PersonaFichaNavigation onChange={ficha.setActiveTab} value={ficha.activeTab} />

        {ficha.activeTab === 'resumen' ? (
          <PersonaFichaResumenSection
            onOpenInfoCompleta={ficha.openInfoCompleta}
            onRetry={() => {
              void ficha.loadResumen();
            }}
            state={ficha.resumenState}
          />
        ) : null}

        {ficha.activeTab === 'asistencia' ? (
          <PersonaFichaAsistenciaSection
            canLoadMore={ficha.canLoadMoreAsistencias}
            filter={ficha.asistenciaFilter}
            onFilterChange={ficha.changeAsistenciaFilter}
            onLoadMore={() => {
              const nextPage = (ficha.asistenciasState.data?.page ?? 0) + 1;
              void ficha.loadAsistencias(nextPage);
            }}
            onRetry={() => {
              void ficha.loadAsistencias(1);
            }}
            state={ficha.asistenciasState}
          />
        ) : null}

        {ficha.activeTab === 'obligaciones' ? (
          <PersonaFichaObligacionesSection
            canLoadMore={ficha.canLoadMoreObligaciones}
            filter={ficha.obligacionFilter}
            onFilterChange={ficha.changeObligacionFilter}
            onLoadMore={() => {
              const nextPage = (ficha.obligacionesState.data?.page ?? 0) + 1;
              void ficha.loadObligaciones(nextPage);
            }}
            onRetry={() => {
              void ficha.loadObligaciones(1);
            }}
            state={ficha.obligacionesState}
          />
        ) : null}

        {ficha.activeTab === 'pagos' ? (
          <PersonaFichaPagosSection
            canLoadMore={ficha.canLoadMorePagos}
            onLoadMore={() => {
              const nextPage = (ficha.pagosState.data?.page ?? 0) + 1;
              void ficha.loadPagos(nextPage);
            }}
            onRetry={() => {
              void ficha.loadPagos(1);
            }}
            state={ficha.pagosState}
          />
        ) : null}

        {ficha.activeTab === 'terrenos' ? (
          <PersonaFichaTerrenosSection
            onRetry={() => {
              void ficha.loadTerrenos();
            }}
            state={ficha.terrenosState}
          />
        ) : null}
      </Stack>

      <PersonaFichaInfoCompletaDialog
        onClose={ficha.closeInfoCompleta}
        open={ficha.infoCompletaOpen}
        state={ficha.infoCompletaState}
      />
    </Box>
  );
}
