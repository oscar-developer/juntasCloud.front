import type { Persona } from '../../personas/types';
import { createFaenaAttendanceTimestamp, mapFaenaAttendanceStatusToEstado } from '../components/faenaAttendanceUi';
import type {
  FaenaAttendanceRowSaveState,
  FaenaAttendanceStatus,
  FaenaParticipacion,
} from '../types';

export type RowMutationState = {
  saveState: FaenaAttendanceRowSaveState;
  errorMessage?: string | null;
  retryStatus?: Exclude<FaenaAttendanceStatus, 'unknown'> | null;
};

export function sortFaenas<T extends { fechaProgramada: string; idFaena: string | number }>(rows: T[]) {
  return [...rows].sort((left, right) => {
    const leftTime = new Date(left.fechaProgramada).getTime();
    const rightTime = new Date(right.fechaProgramada).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return String(right.idFaena).localeCompare(String(left.idFaena));
    }

    return rightTime - leftTime;
  });
}

export function pickDefaultFaena<T extends { idFaena: string | number; estado?: string }>(rows: T[]) {
  return rows.find((row) => row.estado === 'PROGRAMADA') ?? rows[0] ?? null;
}

export function upsertFaenaParticipationRecord(
  current: FaenaParticipacion[],
  nextRecord: FaenaParticipacion,
) {
  const nextPersonaId = String(nextRecord.idPersona);
  const withoutCurrent = current.filter((record) => String(record.idPersona) !== nextPersonaId);
  return [...withoutCurrent, nextRecord];
}

export function restoreFaenaParticipationRecord(
  current: FaenaParticipacion[],
  personaId: string | number,
  previousRecord: FaenaParticipacion | null,
) {
  const withoutCurrent = current.filter((record) => String(record.idPersona) !== String(personaId));
  return previousRecord ? [...withoutCurrent, previousRecord] : withoutCurrent;
}

export function buildOptimisticFaenaParticipationRecord(params: {
  tenantId: string;
  idFaena: string;
  persona: Persona;
  previousRecord: FaenaParticipacion | null;
  nextStatus: Exclude<FaenaAttendanceStatus, 'unknown'>;
  horaLlegada?: string;
  observaciones?: string;
}) {
  const { tenantId, idFaena, persona, previousRecord, nextStatus, horaLlegada, observaciones } = params;
  const nextHoraLlegada =
    nextStatus === 'present'
      ? previousRecord?.horaLlegada ?? createFaenaAttendanceTimestamp()
      : nextStatus === 'late'
        ? horaLlegada ?? previousRecord?.horaLlegada ?? createFaenaAttendanceTimestamp()
        : previousRecord?.horaLlegada ?? null;

  return {
    idFaenaParticipacion:
      previousRecord?.idFaenaParticipacion ?? `optimistic-${idFaena}-${persona.idPersona}`,
    idTenant: previousRecord?.idTenant ?? tenantId,
    idFaena: previousRecord?.idFaena ?? idFaena,
    idPersona: persona.idPersona,
    estado: mapFaenaAttendanceStatusToEstado(nextStatus, previousRecord?.estado),
    horaLlegada: nextHoraLlegada,
    cantPersonasExtra: previousRecord?.cantPersonasExtra ?? 0,
    multaGenerada: previousRecord?.multaGenerada ?? false,
    montoMulta: previousRecord?.montoMulta ?? null,
    observaciones: observaciones?.trim() || previousRecord?.observaciones || null,
    createdAt: previousRecord?.createdAt,
    createdByUser: previousRecord?.createdByUser ?? null,
    updatedAt: previousRecord?.updatedAt ?? null,
    updatedByUser: previousRecord?.updatedByUser ?? null,
    anulado: false,
    anuladoAt: null,
    anuladoByUser: null,
    motivoAnulacion: null,
  } satisfies FaenaParticipacion;
}
