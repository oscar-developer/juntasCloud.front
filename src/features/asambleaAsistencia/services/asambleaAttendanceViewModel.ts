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
}) {
  const { tenantId, idAsamblea, persona, previousRecord, nextStatus } = params;
  const isPadronado = persona.tipoParticipante === 'PADRONADO';

  return {
    idAsistencia: previousRecord?.idAsistencia ?? `optimistic-${idAsamblea}-${persona.idPersona}`,
    idTenant: previousRecord?.idTenant ?? tenantId,
    idAsamblea: previousRecord?.idAsamblea ?? idAsamblea,
    idPersona: persona.idPersona,
    estado: mapAttendanceStatusToEstado(nextStatus, previousRecord?.estado),
    horaLlegada:
      nextStatus === 'present'
        ? previousRecord?.horaLlegada ?? createAttendanceTimestamp()
        : previousRecord?.horaLlegada ?? null,
    esPadronadoEnMomento: previousRecord?.esPadronadoEnMomento ?? isPadronado,
    tieneDerechoVoto: previousRecord?.tieneDerechoVoto ?? isPadronado,
    votoEmitido: previousRecord?.votoEmitido ?? false,
    observaciones: previousRecord?.observaciones ?? null,
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
