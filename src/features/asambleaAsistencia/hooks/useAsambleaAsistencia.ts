import { useMediaQuery, useTheme } from '@mui/material';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAsambleas } from '../../asambleas/services/asambleas.service';
import type { Asamblea } from '../../asambleas/types';
import { getDisplayFullName, getFullName } from '../../personas/components/personaUi';
import { getPersonas } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import { useTenant } from '../../tenant/context/TenantContext';
import {
  formatPersonaSecondaryText,
  formatPersonaCompactAttendanceText,
  getAttendanceErrorMessage,
  mapAttendanceRecordToStatus,
  mapAttendanceStatusToEstado,
  matchesAttendanceFilter,
} from '../components/asambleaAttendanceUi';
import {
  ASAMBLEA_ATTENDANCE_PERSONAS_PAGE_SIZE,
  ASAMBLEA_ATTENDANCE_SAVE_FEEDBACK_TIMEOUT,
} from '../constants';
import {
  createAsambleaAttendance,
  getAsambleaAttendanceList,
  updateAsambleaAttendance,
} from '../services/asambleaAsistencia.service';
import {
  buildOptimisticAttendanceRecord,
  restoreAttendanceRecord,
  RowMutationState,
  sortAsambleas,
  upsertAttendanceRecord,
} from './asambleaAttendanceViewModel';
import type {
  AsambleaAttendanceCreateDto,
  AsambleaAttendanceRecord,
  AttendanceFilter,
  AttendanceRowVM,
  AttendanceStatus,
} from '../types';

export function useAsambleaAsistencia() {
  const { tenant, tenantId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [asambleas, setAsambleas] = useState<Asamblea[]>([]);
  const [asambleasLoading, setAsambleasLoading] = useState(true);
  const [asambleasError, setAsambleasError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(true);
  const [personasError, setPersonasError] = useState<string | null>(null);
  const [personasProgress, setPersonasProgress] = useState({ loaded: 0, total: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<AsambleaAttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceFilter>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [rowStateById, setRowStateById] = useState<Record<string, RowMutationState>>({});
  const deferredSearch = useDeferredValue(searchInput.trim().toLowerCase());
  const activeAsambleaIdRef = useRef('');
  const saveTimeoutsRef = useRef<Record<string, number>>({});
  const requestedAsambleaId = searchParams.get('idAsamblea')?.trim() ?? '';
  const asambleasPagePath = `/app/juntas/${tenantId}/asambleas`;

  const orderedAsambleas = useMemo(() => sortAsambleas(asambleas), [asambleas]);

  const selectedAsambleaId = useMemo(() => {
    if (requestedAsambleaId && orderedAsambleas.some((row) => String(row.idAsamblea) === requestedAsambleaId)) {
      return requestedAsambleaId;
    }

    return orderedAsambleas[0] ? String(orderedAsambleas[0].idAsamblea) : '';
  }, [orderedAsambleas, requestedAsambleaId]);

  const selectedAsamblea = useMemo(
    () => orderedAsambleas.find((row) => String(row.idAsamblea) === selectedAsambleaId) ?? null,
    [orderedAsambleas, selectedAsambleaId],
  );

  const personasById = useMemo(() => {
    const nextMap = new Map<string, Persona>();

    personas.forEach((persona) => {
      nextMap.set(String(persona.idPersona), persona);
    });

    return nextMap;
  }, [personas]);

  const attendanceByPersonaId = useMemo(() => {
    const nextMap = new Map<string, AsambleaAttendanceRecord>();

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
    if (asambleasLoading) {
      return;
    }

    if (!orderedAsambleas.length) {
      if (!requestedAsambleaId) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('idAsamblea');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (requestedAsambleaId === selectedAsambleaId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('idAsamblea', selectedAsambleaId);
    setSearchParams(nextParams, { replace: true });
  }, [
    asambleasLoading,
    orderedAsambleas.length,
    requestedAsambleaId,
    searchParams,
    selectedAsambleaId,
    setSearchParams,
  ]);

  useEffect(() => {
    activeAsambleaIdRef.current = selectedAsambleaId;
    Object.values(saveTimeoutsRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    saveTimeoutsRef.current = {};
    setRowStateById({});
  }, [selectedAsambleaId]);

  useEffect(() => {
    if (!tenantId) {
      setAsambleas([]);
      setAsambleasLoading(false);
      setAsambleasError('No se pudo identificar la junta activa.');
      return;
    }

    const controller = new AbortController();

    const loadAsambleas = async () => {
      setAsambleasLoading(true);
      setAsambleasError(null);

      try {
        const response = await getAsambleas(tenantId, {}, controller.signal);

        if (!controller.signal.aborted) {
          setAsambleas(sortAsambleas(response));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAsambleasError(
            getAttendanceErrorMessage(error, 'No se pudo cargar la lista de asambleas.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setAsambleasLoading(false);
        }
      }
    };

    void loadAsambleas();

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
              pageSize: ASAMBLEA_ATTENDANCE_PERSONAS_PAGE_SIZE,
              estado: 'ACTIVO',
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
            response.items.length < ASAMBLEA_ATTENDANCE_PERSONAS_PAGE_SIZE
          ) {
            break;
          }

          page += 1;
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPersonasError(
            getAttendanceErrorMessage(error, 'No se pudo sincronizar el padrón de personas.'),
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
    if (!tenantId || !selectedAsambleaId) {
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
        const response = await getAsambleaAttendanceList(
          tenantId,
          selectedAsambleaId,
          { anulado: false },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setAttendanceRecords(response.filter((record) => !record.anulado));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAttendanceError(
            getAttendanceErrorMessage(error, 'No se pudo cargar la asistencia de la asamblea.'),
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
  }, [reloadKey, selectedAsambleaId, tenantId]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    attendanceByPersonaId.forEach((record) => {
      const status = mapAttendanceRecordToStatus(record);

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

  const rows = useMemo<AttendanceRowVM[]>(() => {
    return personas.map((persona) => {
      const record = attendanceByPersonaId.get(String(persona.idPersona));
      const rowState = rowStateById[String(persona.idPersona)] ?? { saveState: 'idle' };
      const isPadronado =
        typeof record?.esPadronadoEnMomento === 'boolean'
          ? record.esPadronadoEnMomento
          : persona.tipoParticipante === 'PADRONADO';
      const canVote =
        typeof record?.tieneDerechoVoto === 'boolean'
          ? record.tieneDerechoVoto
          : persona.tipoParticipante === 'PADRONADO';

      return {
        id: String(persona.idPersona),
        personaId: persona.idPersona,
        attendanceId: record?.idAsistencia ?? null,
        primaryText: getFullName(persona) || `Persona ${persona.idPersona}`,
        secondaryText: formatPersonaSecondaryText(persona),
        displayPrimaryText: getDisplayFullName(persona) || `Persona ${persona.idPersona}`,
        compactSecondaryText: formatPersonaCompactAttendanceText(persona, isPadronado, canVote),
        status: mapAttendanceRecordToStatus(record),
        rawStatus: record?.estado ?? null,
        isPadronado,
        canVote,
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
      if (!matchesAttendanceFilter(row.status, statusFilter)) {
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

  const showInitialDataLoading = (asambleasLoading || personasLoading) && !personas.length;
  const showNoAsambleas = !asambleasLoading && !asambleasError && orderedAsambleas.length === 0;
  const showNoPersonas = !personasLoading && !personasError && personas.length === 0;
  const showNoResults =
    Boolean(selectedAsamblea) &&
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
    }, ASAMBLEA_ATTENDANCE_SAVE_FEEDBACK_TIMEOUT);
  };

  const handleSelectAsamblea = (nextAsambleaId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('idAsamblea', nextAsambleaId);
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
    row: AttendanceRowVM,
    nextStatus: Exclude<AttendanceStatus, 'unknown'>,
  ) => {
    if (!tenantId || !selectedAsambleaId) {
      return;
    }

    const persona = personasById.get(String(row.personaId));

    if (!persona) {
      return;
    }

    const rowId = row.id;
    const asambleaSnapshot = selectedAsambleaId;
    const previousRecord = attendanceByPersonaId.get(String(row.personaId)) ?? null;
    const isPadronado = persona.tipoParticipante === 'PADRONADO';
    const nextEstado = mapAttendanceStatusToEstado(nextStatus, previousRecord?.estado);
    const optimisticRecord = buildOptimisticAttendanceRecord({
      tenantId,
      idAsamblea: asambleaSnapshot,
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
    setAttendanceRecords((current) => upsertAttendanceRecord(current, optimisticRecord));

    try {
      let savedRecord: AsambleaAttendanceRecord;

      if (
        previousRecord?.idAsistencia !== undefined &&
        previousRecord?.idAsistencia !== null &&
        !String(previousRecord.idAsistencia).startsWith('optimistic-')
      ) {
        savedRecord = await updateAsambleaAttendance(tenantId, previousRecord.idAsistencia, {
          estado: nextEstado,
          horaLlegada:
            nextStatus === 'present'
              ? previousRecord.horaLlegada ?? optimisticRecord.horaLlegada ?? undefined
              : undefined,
        });
      } else {
        const payload: AsambleaAttendanceCreateDto = {
          idPersona: persona.idPersona,
          estado: nextEstado,
          esPadronadoEnMomento: isPadronado,
          tieneDerechoVoto: isPadronado,
          votoEmitido: previousRecord?.votoEmitido ?? false,
          horaLlegada:
            nextStatus === 'present'
              ? optimisticRecord.horaLlegada ?? undefined
              : undefined,
        };

        savedRecord = await createAsambleaAttendance(tenantId, asambleaSnapshot, payload);
      }

      if (activeAsambleaIdRef.current !== asambleaSnapshot) {
        return;
      }

      setAttendanceRecords((current) => upsertAttendanceRecord(current, savedRecord));
      setSavedFeedback(rowId);
    } catch (error) {
      if (activeAsambleaIdRef.current !== asambleaSnapshot) {
        return;
      }

      setAttendanceRecords((current) =>
        restoreAttendanceRecord(current, row.personaId, previousRecord),
      );
      setRowStateById((current) => ({
        ...current,
        [rowId]: {
          saveState: 'error',
          errorMessage: getAttendanceErrorMessage(error, 'No se pudo registrar la asistencia.'),
          retryStatus: nextStatus,
        },
      }));
    }
  };

  return {
    tenant,
    isDesktop,
    orderedAsambleas,
    asambleasLoading,
    selectedAsamblea,
    selectedAsambleaId,
    summary,
    asambleasPagePath,
    handleSelectAsamblea,
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
    asambleasError,
    personasError,
    attendanceError,
    showInitialDataLoading,
    showNoAsambleas,
    showNoPersonas,
    showNoResults,
    handleSelectStatus,
  };
}
