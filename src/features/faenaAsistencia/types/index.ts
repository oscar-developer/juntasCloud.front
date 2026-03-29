export type FaenaParticipacionEstado =
  | 'PENDIENTE'
  | 'ASISTIO'
  | 'TARDE'
  | 'FALTO'
  | 'JUSTIFICADO';

export type FaenaParticipacion = {
  idFaenaParticipacion: number | string;
  idTenant: number | string;
  idFaena: number | string;
  idPersona: number | string;
  estado: FaenaParticipacionEstado;
  horaLlegada?: string | null;
  cantPersonasExtra: number;
  multaGenerada: boolean;
  montoMulta?: number | null;
  observaciones?: string | null;
  createdAt?: string;
  createdByUser?: number | string | null;
  updatedAt?: string | null;
  updatedByUser?: number | string | null;
  anulado: boolean;
  anuladoAt?: string | null;
  anuladoByUser?: number | string | null;
  motivoAnulacion?: string | null;
};

export type FaenaParticipacionCreateDto = {
  idPersona: number | string;
  estado?: FaenaParticipacionEstado;
  horaLlegada?: string;
  cantPersonasExtra?: number;
  multaGenerada?: boolean;
  montoMulta?: number;
  observaciones?: string;
};

export type FaenaParticipacionUpdateDto = Partial<FaenaParticipacionCreateDto>;

export type AnularFaenaParticipacionDto = {
  motivoAnulacion: string;
};

export type FaenaParticipacionListQuery = {
  estado?: FaenaParticipacionEstado | 'TODOS';
  anulado?: boolean;
  idPersona?: number | string;
};

export type FaenaAttendanceStatus = 'present' | 'absent' | 'unknown';

export type FaenaAttendanceFilter = 'all' | 'present' | 'absent' | 'unknown';

export type FaenaAttendanceRowSaveState = 'idle' | 'saving' | 'saved' | 'error';

export type FaenaAttendanceRowVM = {
  id: string;
  personaId: number | string;
  participationId?: number | string | null;
  primaryText: string;
  secondaryText?: string;
  participantType: 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';
  status: FaenaAttendanceStatus;
  rawStatus?: FaenaParticipacionEstado | null;
  isSaving: boolean;
  saveState: FaenaAttendanceRowSaveState;
  errorMessage?: string | null;
  retryStatus?: Exclude<FaenaAttendanceStatus, 'unknown'> | null;
};

export type FaenaAttendanceSummaryVM = {
  total: number;
  present: number;
  absent: number;
  pending: number;
};
