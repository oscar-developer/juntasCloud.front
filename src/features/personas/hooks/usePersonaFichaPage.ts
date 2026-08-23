import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonaErrorMessage } from '../components/personaUi';
import {
  getPersonaById,
  getPersonaFichaAsistencias,
  getPersonaFichaObligaciones,
  getPersonaFichaPagos,
  getPersonaFichaResumen,
  getPersonaFichaTerrenos,
} from '../services/personas.service';
import type {
  Persona,
  PersonaAsistenciaFicha,
  PersonaFichaPaginatedResponse,
  PersonaFichaResumen,
  PersonaFichaSectionState,
  PersonaFichaTab,
  PersonaObligacionFicha,
  PersonaPagoFicha,
  PersonaTerrenoFicha,
} from '../types';

export type PersonaFichaAsistenciaFilter = 'TODAS' | 'FAENA' | 'ASAMBLEA';
export type PersonaFichaObligacionFilter = 'PENDIENTES' | 'PAGADAS' | 'TODAS';

const FICHA_PAGE_LIMIT = 20;

function createSectionState<T>(): PersonaFichaSectionState<T> {
  return {
    status: 'idle',
    data: null,
    error: null,
  };
}

function appendPaginatedItems<T>(
  previous: PersonaFichaPaginatedResponse<T> | null,
  next: PersonaFichaPaginatedResponse<T>,
): PersonaFichaPaginatedResponse<T> {
  if (!previous || next.page <= 1) {
    return next;
  }

  return {
    ...next,
    items: [...previous.items, ...next.items],
  };
}

function getObligacionEstado(filter: PersonaFichaObligacionFilter) {
  if (filter === 'PAGADAS') {
    return 'PAGADA';
  }

  if (filter === 'PENDIENTES') {
    return 'PENDIENTE';
  }

  return undefined;
}

export function usePersonaFichaPage() {
  const { tenantId, personaId } = useParams<{ tenantId: string; personaId: string }>();
  const navigate = useNavigate();
  const personasPath = tenantId ? `/app/juntas/${tenantId}/personas` : '/app/juntas';

  const [activeTab, setActiveTab] = useState<PersonaFichaTab>('resumen');
  const [resumenState, setResumenState] = useState(createSectionState<PersonaFichaResumen>());
  const [infoCompletaState, setInfoCompletaState] = useState(createSectionState<Persona>());
  const [infoCompletaOpen, setInfoCompletaOpen] = useState(false);
  const [asistenciaFilter, setAsistenciaFilter] = useState<PersonaFichaAsistenciaFilter>('TODAS');
  const [obligacionFilter, setObligacionFilter] = useState<PersonaFichaObligacionFilter>('PENDIENTES');
  const [asistenciasState, setAsistenciasState] = useState(
    createSectionState<PersonaFichaPaginatedResponse<PersonaAsistenciaFicha>>(),
  );
  const [obligacionesState, setObligacionesState] = useState(
    createSectionState<PersonaFichaPaginatedResponse<PersonaObligacionFicha>>(),
  );
  const [pagosState, setPagosState] = useState(
    createSectionState<PersonaFichaPaginatedResponse<PersonaPagoFicha>>(),
  );
  const [terrenosState, setTerrenosState] = useState(createSectionState<PersonaTerrenoFicha[]>());

  const canLoadFicha = Boolean(tenantId && personaId);

  const loadResumen = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        setResumenState({
          status: 'error',
          data: null,
          error: 'No se pudo identificar la persona solicitada.',
        });
        return;
      }

      setResumenState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaFichaResumen(tenantId, personaId, signal);
        setResumenState({ status: 'success', data, error: null });
      } catch (error) {
        if (!signal?.aborted) {
          setResumenState({
            status: 'error',
            data: null,
            error: getPersonaErrorMessage(error, 'No se pudo cargar el resumen de la ficha.'),
          });
        }
      }
    },
    [personaId, tenantId],
  );

  const loadInfoCompleta = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        setInfoCompletaState({
          status: 'error',
          data: null,
          error: 'No se pudo identificar la persona solicitada.',
        });
        return;
      }

      setInfoCompletaState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaById(tenantId, personaId, signal);
        setInfoCompletaState({ status: 'success', data, error: null });
      } catch (error) {
        if (!signal?.aborted) {
          setInfoCompletaState({
            status: 'error',
            data: null,
            error: getPersonaErrorMessage(error, 'No se pudo cargar la información completa.'),
          });
        }
      }
    },
    [personaId, tenantId],
  );

  const loadAsistencias = useCallback(
    async (page = 1, signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        return;
      }

      setAsistenciasState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaFichaAsistencias(
          tenantId,
          personaId,
          {
            tipo: asistenciaFilter === 'TODAS' ? undefined : asistenciaFilter,
            page,
            limit: FICHA_PAGE_LIMIT,
          },
          signal,
        );

        setAsistenciasState((current) => ({
          status: 'success',
          data: appendPaginatedItems(current.data, data),
          error: null,
        }));
      } catch (error) {
        if (!signal?.aborted) {
          setAsistenciasState((current) => ({
            ...current,
            status: 'error',
            error: getPersonaErrorMessage(error, 'No se pudieron cargar las asistencias.'),
          }));
        }
      }
    },
    [asistenciaFilter, personaId, tenantId],
  );

  const loadObligaciones = useCallback(
    async (page = 1, signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        return;
      }

      setObligacionesState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaFichaObligaciones(
          tenantId,
          personaId,
          {
            estado: getObligacionEstado(obligacionFilter),
            page,
            limit: FICHA_PAGE_LIMIT,
          },
          signal,
        );

        setObligacionesState((current) => ({
          status: 'success',
          data: appendPaginatedItems(current.data, data),
          error: null,
        }));
      } catch (error) {
        if (!signal?.aborted) {
          setObligacionesState((current) => ({
            ...current,
            status: 'error',
            error: getPersonaErrorMessage(error, 'No se pudieron cargar las obligaciones.'),
          }));
        }
      }
    },
    [obligacionFilter, personaId, tenantId],
  );

  const loadPagos = useCallback(
    async (page = 1, signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        return;
      }

      setPagosState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaFichaPagos(
          tenantId,
          personaId,
          { page, limit: FICHA_PAGE_LIMIT },
          signal,
        );

        setPagosState((current) => ({
          status: 'success',
          data: appendPaginatedItems(current.data, data),
          error: null,
        }));
      } catch (error) {
        if (!signal?.aborted) {
          setPagosState((current) => ({
            ...current,
            status: 'error',
            error: getPersonaErrorMessage(error, 'No se pudieron cargar los pagos.'),
          }));
        }
      }
    },
    [personaId, tenantId],
  );

  const loadTerrenos = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId || !personaId) {
        return;
      }

      setTerrenosState((current) => ({ ...current, status: 'loading', error: null }));

      try {
        const data = await getPersonaFichaTerrenos(tenantId, personaId, signal);
        setTerrenosState({ status: 'success', data, error: null });
      } catch (error) {
        if (!signal?.aborted) {
          setTerrenosState({
            status: 'error',
            data: null,
            error: getPersonaErrorMessage(error, 'No se pudieron cargar los terrenos.'),
          });
        }
      }
    },
    [personaId, tenantId],
  );

  useEffect(() => {
    setActiveTab('resumen');
    setResumenState(createSectionState<PersonaFichaResumen>());
    setInfoCompletaState(createSectionState<Persona>());
    setInfoCompletaOpen(false);
    setAsistenciaFilter('TODAS');
    setObligacionFilter('PENDIENTES');
    setAsistenciasState(createSectionState<PersonaFichaPaginatedResponse<PersonaAsistenciaFicha>>());
    setObligacionesState(createSectionState<PersonaFichaPaginatedResponse<PersonaObligacionFicha>>());
    setPagosState(createSectionState<PersonaFichaPaginatedResponse<PersonaPagoFicha>>());
    setTerrenosState(createSectionState<PersonaTerrenoFicha[]>());
  }, [personaId, tenantId]);

  useEffect(() => {
    if (!canLoadFicha || resumenState.status !== 'idle') {
      return undefined;
    }

    const controller = new AbortController();
    void loadResumen(controller.signal);

    return () => {
      controller.abort();
    };
  }, [canLoadFicha, loadResumen]);

  useEffect(() => {
    if (!canLoadFicha || activeTab !== 'asistencia' || asistenciasState.status !== 'idle') {
      return undefined;
    }

    const controller = new AbortController();
    void loadAsistencias(1, controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab, canLoadFicha, loadAsistencias]);

  useEffect(() => {
    if (!canLoadFicha || activeTab !== 'obligaciones' || obligacionesState.status !== 'idle') {
      return undefined;
    }

    const controller = new AbortController();
    void loadObligaciones(1, controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab, canLoadFicha, loadObligaciones]);

  useEffect(() => {
    if (!canLoadFicha || activeTab !== 'pagos' || pagosState.status !== 'idle') {
      return undefined;
    }

    const controller = new AbortController();
    void loadPagos(1, controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab, canLoadFicha, loadPagos]);

  useEffect(() => {
    if (!canLoadFicha || activeTab !== 'terrenos' || terrenosState.status !== 'idle') {
      return undefined;
    }

    const controller = new AbortController();
    void loadTerrenos(controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeTab, canLoadFicha, loadTerrenos]);

  const changeAsistenciaFilter = (nextFilter: PersonaFichaAsistenciaFilter) => {
    setAsistenciaFilter(nextFilter);
    setAsistenciasState(createSectionState<PersonaFichaPaginatedResponse<PersonaAsistenciaFicha>>());
  };

  const changeObligacionFilter = (nextFilter: PersonaFichaObligacionFilter) => {
    setObligacionFilter(nextFilter);
    setObligacionesState(createSectionState<PersonaFichaPaginatedResponse<PersonaObligacionFicha>>());
  };

  const openInfoCompleta = () => {
    setInfoCompletaOpen(true);

    if (infoCompletaState.status === 'idle') {
      void loadInfoCompleta();
    }
  };

  const closeInfoCompleta = () => {
    setInfoCompletaOpen(false);
  };

  const goBackToPersonas = () => {
    navigate(personasPath);
  };

  const canLoadMoreAsistencias = useMemo(() => {
    const data = asistenciasState.data;
    return Boolean(data && data.items.length < data.total && asistenciasState.status !== 'loading');
  }, [asistenciasState.data, asistenciasState.status]);

  const canLoadMoreObligaciones = useMemo(() => {
    const data = obligacionesState.data;
    return Boolean(data && data.items.length < data.total && obligacionesState.status !== 'loading');
  }, [obligacionesState.data, obligacionesState.status]);

  const canLoadMorePagos = useMemo(() => {
    const data = pagosState.data;
    return Boolean(data && data.items.length < data.total && pagosState.status !== 'loading');
  }, [pagosState.data, pagosState.status]);

  return {
    tenantId,
    personaId,
    activeTab,
    resumenState,
    asistenciaFilter,
    asistenciasState,
    obligacionFilter,
    obligacionesState,
    pagosState,
    terrenosState,
    infoCompletaOpen,
    infoCompletaState,
    personasPath,
    setActiveTab,
    changeAsistenciaFilter,
    changeObligacionFilter,
    loadResumen,
    loadAsistencias,
    loadObligaciones,
    loadPagos,
    loadTerrenos,
    canLoadMoreAsistencias,
    canLoadMoreObligaciones,
    canLoadMorePagos,
    openInfoCompleta,
    closeInfoCompleta,
    goBackToPersonas,
  };
}
