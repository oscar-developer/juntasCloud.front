import { useMediaQuery, useTheme } from '@mui/material';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFaenas } from '../../faenas/services/faenas.service';
import type { Faena } from '../../faenas/types';
import { getFullName } from '../../personas/components/personaUi';
import { getPersonas } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import { useTenant } from '../../tenant/context/TenantContext';
import {
  formatPersonaSecondaryText,
  getFaenaAttendanceErrorMessage,
  mapFaenaAttendanceRecordToStatus,
  mapFaenaAttendanceStatusToEstado,
  matchesFaenaAttendanceFilter,
} from '../components/faenaAttendanceUi';
import {
  FAENA_ATTENDANCE_PERSONAS_PAGE_SIZE,
  FAENA_ATTENDANCE_SAVE_FEEDBACK_TIMEOUT,
} from '../constants';
import {
  createFaenaParticipacion,
  getFaenaParticipaciones,
  updateFaenaParticipacion,
} from '../services/faenaAsistencia.service';
import {
  buildOptimisticFaenaParticipationRecord,
  pickDefaultFaena,
  restoreFaenaParticipationRecord,
  RowMutationState,
  sortFaenas,
  upsertFaenaParticipationRecord,
} from './faenaAttendanceViewModel';
import type {
  FaenaAttendanceFilter,
  FaenaAttendanceRowVM,
  FaenaAttendanceStatus,
  FaenaParticipacion,
  FaenaParticipacionCreateDto,
} from '../types';

export function useFaenaAsistencia() {
  const { tenant, tenantId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [faenas, setFaenas] = useState<Faena[]>([]);
  const [faenasLoading, setFaenasLoading] = useState(true);
  const [faenasError, setFaenasError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(true);
  const [personasError, setPersonasError] = useState<string | null>(null);
  const [personasProgress, setPersonasProgress] = useState({ loaded: 0, total: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<FaenaParticipacion[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<FaenaAttendanceFilter>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [rowStateById, setRowStateById] = useState<Record<string, RowMutationState>>({});
  const deferredSearch = useDeferredValue(searchInput.trim().toLowerCase());
  const activeFaenaIdRef = useRef('');
  const saveTimeoutsRef = useRef<Record<string, number>>({});
  const requestedFaenaId = searchParams.get('idFaena')?.trim() ?? '';
  const faenasPagePath = `/app/juntas/${tenantId}/faenas`;

  const orderedFaenas = useMemo(() => sortFaenas(faenas), [faenas]);

  const selectedFaenaId = useMemo(() => {
    if (requestedFaenaId && orderedFaenas.some((row) => String(row.idFaena) === requestedFaenaId)) {
      return requestedFaenaId;
    }

    const defaultFaena = pickDefaultFaena(orderedFaenas);
    return defaultFaena ? String(defaultFaena.idFaena) : '';
  }, [orderedFaenas, requestedFaenaId]);

  const selectedFaena = useMemo(
    () => orderedFaenas.find((row) => String(row.idFaena) === selectedFaenaId) ?? null,
    [orderedFaenas, selectedFaenaId],
  );

  const personasById = useMemo(() => {
    const nextMap = new Map<string, Persona>();

    personas.forEach((persona) => {
      nextMap.set(String(persona.idPersona), persona);
    });

    return nextMap;
  }, [personas]);

  const attendanceByPersonaId = useMemo(() => {
    const nextMap = new Map<string, FaenaParticipacion>();

    attendanceRecords.forEach((record) => {
      if (!record.anulado) {
        nextMap.set(String(record.idPersona), record);
      }
    });

    return nextMap;
  }, [attendanceRecords]);

  useEffect(() => {
    return () => {
      Object.values(saveTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    if (faenasLoading) {
      return;
    }

    if (!orderedFaenas.length) {
      if (!requestedFaenaId) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('idFaena');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (requestedFaenaId === selectedFaenaId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('idFaena', selectedFaenaId);
    setSearchParams(nextParams, { replace: true });
  }, [
    faenasLoading,
    orderedFaenas.length,
    requestedFaenaId,
    searchParams,
    selectedFaenaId,
    setSearchParams,
  ]);

  useEffect(() => {
    activeFaenaIdRef.current = selectedFaenaId;
    Object.values(saveTimeoutsRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    saveTimeoutsRef.current = {};
    setRowStateById({});
  }, [selectedFaenaId]);

  useEffect(() => {
    if (!tenantId) {
      setFaenas([]);
      setFaenasLoading(false);
      setFaenasError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadFaenas = async () => {
      setFaenasLoading(true);
      setFaenasError(null);

      try {
        const response = await getFaenas(
          tenantId,
          { from: '', to: '', search: '', tipoFaena: 'TODOS', estado: 'TODOS' },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setFaenas(sortFaenas(response));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFaenasError(
            getFaenaAttendanceErrorMessage(error, 'No se pudo cargar la lista de faenas.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFaenasLoading(false);
        }
      }
    };

    void loadFaenas();

    return () => {
      controller.abort();
    };
  }, [reloadKey, tenantId]);

  useEffect(() => {
    if (!tenantId) {
      setPersonas([]);
      setPersonasLoading(false);
      setPersonasError('No se pudo identificar la junta activa.');
      setPersonasProgress({ loaded: 0, total: 0 });
      return;
    }

    const controller = new AbortController();

    const loadPersonas = async () => {
      setPersonas([]);
      setPersonasLoading(true);
      setPersonasError(null);
      setPersonasProgress({ loaded: 0, total: 0 });

      let page = 1;
      const collected = new Map<string, Persona>();

      try {
        while (!controller.signal.aborted) {
          const response = await getPersonas(
            tenantId,
            {
              page,
              pageSize: FAENA_ATTENDANCE_PERSONAS_PAGE_SIZE,
              search: '',
              dni: '',
              estado: 'ACTIVO',
              tipoParticipante: 'TODOS',
            },
            controller.signal,
          );

          response.items.forEach((persona) => {
            collected.set(String(persona.idPersona), persona);
          });

          if (!controller.signal.aborted) {
            const nextItems = Array.from(collected.values());
            setPersonas(nextItems);
            setPersonasProgress({ loaded: nextItems.length, total: response.total });
          }

          if (
            response.items.length === 0 ||
            collected.size >= response.total ||
            response.items.length < FAENA_ATTENDANCE_PERSONAS_PAGE_SIZE
          ) {
            break;
          }

          page += 1;
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPersonasError(
            getFaenaAttendanceErrorMessage(error, 'No se pudo sincronizar el padrón de personas.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setPersonasLoading(false);
        }
      }
    };

    void loadPersonas();

    return () => {
      controller.abort();
    };
  }, [reloadKey, tenantId]);

  useEffect(() => {
    if (!tenantId || !selectedFaenaId) {
      setAttendanceRecords([]);
      setAttendanceLoading(false);
      setAttendanceError(null);
      return;
    }

    const controller = new AbortController();

    const loadAttendance = async () => {
      setAttendanceRecords([]);
      setAttendanceLoading(true);
      setAttendanceError(null);

      try {
        const response = await getFaenaParticipaciones(
          tenantId,
          selectedFaenaId,
          { anulado: false },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setAttendanceRecords(response.filter((record) => !record.anulado));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAttendanceError(
            getFaenaAttendanceErrorMessage(
              error,
              'No se pudo cargar la asistencia de la faena seleccionada.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAttendanceLoading(false);
        }
      }
    };

    void loadAttendance();

    return () => {
      controller.abort();
    };
  }, [reloadKey, selectedFaenaId, tenantId]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    attendanceByPersonaId.forEach((record) => {
      const status = mapFaenaAttendanceRecordToStatus(record);

      if (status === 'present') {
        present += 1;
      } else if (status === 'absent') {
        absent += 1;
      }
    });

    const total = personasProgress.total || personas.length;
    const pending = Math.max(total - present - absent, 0);

    return {
      total,
      present,
      absent,
      pending,
    };
  }, [attendanceByPersonaId, personas.length, personasProgress.total]);

  const rows = useMemo<FaenaAttendanceRowVM[]>(() => {
    return personas.map((persona) => {
      const record = attendanceByPersonaId.get(String(persona.idPersona));
      const rowState = rowStateById[String(persona.idPersona)] ?? { saveState: 'idle' };

      return {
        id: String(persona.idPersona),
        personaId: persona.idPersona,
        participationId: record?.idFaenaParticipacion ?? null,
        primaryText: getFullName(persona) || `Persona ${persona.idPersona}`,
        secondaryText: formatPersonaSecondaryText(persona),
        participantType: persona.tipoParticipante,
        status: mapFaenaAttendanceRecordToStatus(record),
        rawStatus: record?.estado ?? null,
        isSaving: rowState.saveState === 'saving',
        saveState: rowState.saveState,
        errorMessage: rowState.errorMessage ?? null,
        retryStatus: rowState.retryStatus ?? null,
      };
    });
  }, [attendanceByPersonaId, personas, rowStateById]);

  const filterCounts = useMemo(
    () => ({
      all: summary.total,
      unknown: summary.pending,
      present: summary.present,
      absent: summary.absent,
    }),
    [summary],
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesFaenaAttendanceFilter(row.status, statusFilter)) {
        return false;
      }

      if (!deferredSearch) {
        return true;
      }

      const persona = personasById.get(String(row.personaId));
      const haystack = [
        row.primaryText,
        row.secondaryText ?? '',
        persona?.dni ?? '',
        persona?.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [deferredSearch, personasById, rows, statusFilter]);

  const showInitialDataLoading = (faenasLoading || personasLoading) && !personas.length;
  const showNoFaenas = !faenasLoading && !faenasError && orderedFaenas.length === 0;
  const showNoPersonas = !personasLoading && !personasError && personas.length === 0;
  const showNoResults =
    Boolean(selectedFaena) &&
    !showInitialDataLoading &&
    !attendanceLoading &&
    !personasLoading &&
    filteredRows.length === 0 &&
    personas.length > 0;

  const clearRowSaveFeedback = (rowId: string) => {
    const timeoutId = saveTimeoutsRef.current[rowId];

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete saveTimeoutsRef.current[rowId];
    }
  };

  const setSavedFeedback = (rowId: string) => {
    clearRowSaveFeedback(rowId);
    setRowStateById((current) => ({
      ...current,
      [rowId]: {
        saveState: 'saved',
      },
    }));

    saveTimeoutsRef.current[rowId] = window.setTimeout(() => {
      setRowStateById((current) => {
        const nextState = current[rowId];

        if (!nextState || nextState.saveState !== 'saved') {
          return current;
        }

        const { [rowId]: _removed, ...rest } = current;
        return rest;
      });
      delete saveTimeoutsRef.current[rowId];
    }, FAENA_ATTENDANCE_SAVE_FEEDBACK_TIMEOUT);
  };

  const handleSelectFaena = (nextFaenaId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('idFaena', nextFaenaId);
    setSearchParams(nextParams);
  };

  const handleReload = () => {
    setReloadKey((current) => current + 1);
  };

  const handleClearToolbar = () => {
    setSearchInput('');
    setStatusFilter('all');
  };

  const handleSelectStatus = async (
    row: FaenaAttendanceRowVM,
    nextStatus: Exclude<FaenaAttendanceStatus, 'unknown'>,
  ) => {
    if (!tenantId || !selectedFaenaId) {
      return;
    }

    const persona = personasById.get(String(row.personaId));

    if (!persona) {
      return;
    }

    const rowId = row.id;
    const faenaSnapshot = selectedFaenaId;
    const previousRecord = attendanceByPersonaId.get(String(row.personaId)) ?? null;
    const nextEstado = mapFaenaAttendanceStatusToEstado(nextStatus, previousRecord?.estado);
    const optimisticRecord = buildOptimisticFaenaParticipationRecord({
      tenantId,
      idFaena: faenaSnapshot,
      persona,
      previousRecord,
      nextStatus,
    });

    clearRowSaveFeedback(rowId);
    setRowStateById((current) => ({
      ...current,
      [rowId]: {
        saveState: 'saving',
        retryStatus: nextStatus,
      },
    }));
    setAttendanceRecords((current) => upsertFaenaParticipationRecord(current, optimisticRecord));

    try {
      let savedRecord: FaenaParticipacion;

      if (
        previousRecord?.idFaenaParticipacion !== undefined &&
        previousRecord?.idFaenaParticipacion !== null &&
        !String(previousRecord.idFaenaParticipacion).startsWith('optimistic-')
      ) {
        savedRecord = await updateFaenaParticipacion(tenantId, previousRecord.idFaenaParticipacion, {
          estado: nextEstado,
          horaLlegada:
            nextStatus === 'present'
              ? previousRecord.horaLlegada ?? optimisticRecord.horaLlegada ?? undefined
              : undefined,
        });
      } else {
        const payload: FaenaParticipacionCreateDto = {
          idPersona: persona.idPersona,
          estado: nextEstado,
          cantPersonasExtra: previousRecord?.cantPersonasExtra ?? 0,
          multaGenerada: previousRecord?.multaGenerada ?? false,
          montoMulta: previousRecord?.montoMulta ?? undefined,
          observaciones: previousRecord?.observaciones ?? undefined,
          horaLlegada:
            nextStatus === 'present' ? optimisticRecord.horaLlegada ?? undefined : undefined,
        };

        savedRecord = await createFaenaParticipacion(tenantId, faenaSnapshot, payload);
      }

      if (activeFaenaIdRef.current !== faenaSnapshot) {
        return;
      }

      setAttendanceRecords((current) => upsertFaenaParticipationRecord(current, savedRecord));
      setSavedFeedback(rowId);
    } catch (error) {
      if (activeFaenaIdRef.current !== faenaSnapshot) {
        return;
      }

      setAttendanceRecords((current) =>
        restoreFaenaParticipationRecord(current, row.personaId, previousRecord),
      );
      setRowStateById((current) => ({
        ...current,
        [rowId]: {
          saveState: 'error',
          errorMessage: getFaenaAttendanceErrorMessage(
            error,
            'No se pudo registrar la asistencia.',
          ),
          retryStatus: nextStatus,
        },
      }));
    }
  };

  return {
    tenant,
    tenantId,
    isDesktop,
    orderedFaenas,
    faenasLoading,
    selectedFaena,
    selectedFaenaId,
    summary,
    faenasPagePath,
    handleSelectFaena,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    handleClearToolbar,
    handleReload,
    filteredRows,
    filterCounts,
    attendanceLoading,
    personasLoading,
    personasProgress,
    faenasError,
    personasError,
    attendanceError,
    showInitialDataLoading,
    showNoFaenas,
    showNoPersonas,
    showNoResults,
    handleSelectStatus,
  };
}
