import type { Persona } from '../../personas/types';
import { createAttendanceTimestamp, mapAttendanceStatusToEstado } from '../components/asambleaAttendanceUi';
import type {
  AsambleaAttendanceRecord,
  AttendanceRowSaveState,
  AttendanceStatus,
} from '../types';

export type RowMutationState = {
  saveState: AttendanceRowSaveState;
  errorMessage?: string | null;
  retryStatus?: Exclude<AttendanceStatus, 'unknown'> | null;
};

export function sortAsambleas<T extends { fechaProgramada: string; idAsamblea: string | number }>(
  rows: T[],
) {
  return [...rows].sort((left, right) => {
    const leftTime = new Date(left.fechaProgramada).getTime();
    const rightTime = new Date(right.fechaProgramada).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return String(right.idAsamblea).localeCompare(String(left.idAsamblea));
    }

    return rightTime - leftTime;
  });
}

export function upsertAttendanceRecord(
  current: AsambleaAttendanceRecord[],
  nextRecord: AsambleaAttendanceRecord,
) {
  const nextPersonaId = String(nextRecord.idPersona);
  const withoutCurrent = current.filter((record) => String(record.idPersona) !== nextPersonaId);
  return [...withoutCurrent, nextRecord];
}

export function restoreAttendanceRecord(
  current: AsambleaAttendanceRecord[],
  personaId: string | number,
  previousRecord: AsambleaAttendanceRecord | null,
) {
  const withoutCurrent = current.filter((record) => String(record.idPersona) !== String(personaId));
  return previousRecord ? [...withoutCurrent, previousRecord] : withoutCurrent;
}

export function buildOptimisticAttendanceRecord(params: {
  tenantId: string;
  idAsamblea: string;
  persona: Persona;
  previousRecord: AsambleaAttendanceRecord | null;
  nextStatus: Exclude<AttendanceStatus, 'unknown'>;
  horaLlegada?: string;
  observaciones?: string;
}) {
  const { tenantId, idAsamblea, persona, previousRecord, nextStatus, horaLlegada, observaciones } = params;
  const isPadronado = persona.tipoParticipante === 'PADRONADO';
  const nextHoraLlegada =
    nextStatus === 'present'
      ? previousRecord?.horaLlegada ?? createAttendanceTimestamp()
      : nextStatus === 'late'
        ? horaLlegada ?? previousRecord?.horaLlegada ?? createAttendanceTimestamp()
        : previousRecord?.horaLlegada ?? null;

  return {
    idAsistencia: previousRecord?.idAsistencia ?? `optimistic-${idAsamblea}-${persona.idPersona}`,
    idTenant: previousRecord?.idTenant ?? tenantId,
    idAsamblea: previousRecord?.idAsamblea ?? idAsamblea,
    idPersona: persona.idPersona,
    estado: mapAttendanceStatusToEstado(nextStatus, previousRecord?.estado),
    horaLlegada: nextHoraLlegada,
    esPadronadoEnMomento: previousRecord?.esPadronadoEnMomento ?? isPadronado,
    tieneDerechoVoto: previousRecord?.tieneDerechoVoto ?? isPadronado,
    votoEmitido: previousRecord?.votoEmitido ?? false,
    observaciones: observaciones?.trim() || previousRecord?.observaciones || null,
    createdAt: previousRecord?.createdAt,
    createdByUser: previousRecord?.createdByUser ?? null,
    updatedAt: previousRecord?.updatedAt ?? null,
    updatedByUser: previousRecord?.updatedByUser ?? null,
    anulado: false,
    anuladoAt: null,
    anuladoByUser: null,
    motivoAnulacion: null,
  } satisfies AsambleaAttendanceRecord;
}
