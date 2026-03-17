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
