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

export type FaenaParticipacionApiShape = {
  idFaenaParticipacion?: number | string;
  id_faena_participacion?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  idFaena?: number | string;
  id_faena?: number | string;
  idPersona?: number | string;
  id_persona?: number | string;
  estado?: FaenaParticipacionEstado;
  horaLlegada?: string | null;
  hora_llegada?: string | null;
  cantPersonasExtra?: number;
  cant_personas_extra?: number;
  multaGenerada?: boolean;
  multa_generada?: boolean;
  montoMulta?: number | null;
  monto_multa?: number | null;
  observaciones?: string | null;
  createdAt?: string;
  created_at?: string;
  createdByUser?: number | string | null;
  created_by_user?: number | string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
  updatedByUser?: number | string | null;
  updated_by_user?: number | string | null;
  anulado?: boolean;
  anuladoAt?: string | null;
  anulado_at?: string | null;
  anuladoByUser?: number | string | null;
  anulado_by_user?: number | string | null;
  motivoAnulacion?: string | null;
  motivo_anulacion?: string | null;
};
