export type AsistenciaAsambleaEstado =
  | 'PENDIENTE'
  | 'ASISTIO'
  | 'TARDE'
  | 'FALTO'
  | 'JUSTIFICADO';

export type AttendanceStatus = 'present' | 'absent' | 'unknown';

export type AttendanceFilter = 'all' | 'present' | 'absent' | 'unknown';

export type AttendanceRowSaveState = 'idle' | 'saving' | 'saved' | 'error';

export type AsambleaAttendanceRecord = {
  idAsistencia: number | string;
  idTenant: number | string;
  idAsamblea: number | string;
  idPersona: number | string;
  estado: AsistenciaAsambleaEstado;
  horaLlegada?: string | null;
  esPadronadoEnMomento: boolean;
  tieneDerechoVoto?: boolean | null;
  votoEmitido?: boolean | null;
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

export type AsambleaAttendanceCreateDto = {
  idPersona: number | string;
  estado?: AsistenciaAsambleaEstado;
  horaLlegada?: string;
  esPadronadoEnMomento: boolean;
  tieneDerechoVoto?: boolean;
  votoEmitido?: boolean;
  observaciones?: string;
};

export type AsambleaAttendanceUpdateDto = Partial<AsambleaAttendanceCreateDto>;

export type AnularAsambleaAttendanceDto = {
  motivoAnulacion: string;
};

export type AsambleaAttendanceListQuery = {
  estado?: AsistenciaAsambleaEstado;
  anulado?: boolean;
  idPersona?: number | string;
};

export type AttendanceRowVM = {
  id: string;
  personaId: number | string;
  attendanceId?: number | string | null;
  primaryText: string;
  secondaryText?: string;
  status: AttendanceStatus;
  rawStatus?: AsistenciaAsambleaEstado | null;
  isPadronado: boolean;
  canVote: boolean;
  isSaving: boolean;
  saveState: AttendanceRowSaveState;
  errorMessage?: string | null;
  retryStatus?: Exclude<AttendanceStatus, 'unknown'> | null;
};

export type AttendanceSummaryVM = {
  total: number;
  present: number;
  absent: number;
  pending: number;
};

export type AsambleaAttendanceApiShape = {
  idAsistencia?: number | string;
  id_asistencia?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  idAsamblea?: number | string;
  id_asamblea?: number | string;
  idPersona?: number | string;
  id_persona?: number | string;
  estado?: AsistenciaAsambleaEstado;
  horaLlegada?: string | null;
  hora_llegada?: string | null;
  esPadronadoEnMomento?: boolean;
  es_padronado_en_momento?: boolean;
  tieneDerechoVoto?: boolean | null;
  tiene_derecho_voto?: boolean | null;
  votoEmitido?: boolean | null;
  voto_emitido?: boolean | null;
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
