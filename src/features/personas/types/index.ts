export type PersonaEstado = 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO' | 'FALLECIDO';

export type PersonaTipoParticipante = 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';

export type Persona = {
  idPersona: number | string;
  idTenant: number | string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  referenciaVivienda?: string | null;
  tipoParticipante: PersonaTipoParticipante;
  nroPadron?: number | null;
  estado: PersonaEstado;
  fechaRegistro: string;
  fechaBaja?: string | null;
  observaciones?: string | null;
};

export type PersonaCreateDto = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  referenciaVivienda?: string;
  tipoParticipante: PersonaTipoParticipante;
  fechaRegistro: string;
  observaciones?: string;
};

export type PersonaUpdateDto = Partial<PersonaCreateDto> & {
  estado?: PersonaEstado;
  fechaBaja?: string | null;
  nroPadron?: number | null;
};

export type ListQuery = {
  search?: string;
  dni?: string;
  estado?: PersonaEstado | 'TODOS';
  tipoParticipante?: PersonaTipoParticipante | 'TODOS';
  page: number;
  pageSize: number;
};

export type PersonasListResponse = {
  items: Persona[];
  total: number;
};

export type PersonaFichaTab = 'resumen' | 'asistencia' | 'obligaciones' | 'pagos' | 'terrenos';

export type PersonaFichaLoadStatus = 'idle' | 'loading' | 'success' | 'error';

export type PersonaFichaSectionState<T> = {
  status: PersonaFichaLoadStatus;
  data: T | null;
  error: string | null;
};

export type PersonaFichaPersona = {
  idPersona: number | string;
  nroPadron: number | null;
  nombres: string;
  nombreCompleto: string;
  dni: string | null;
  telefono: string | null;
  estado: PersonaEstado | string;
};

export type PersonaFichaFinanciero = {
  deudaPendienteTotal: number;
};

export type PersonaFichaResumenAsistencia = {
  total: number;
  asistencias: number;
  faltas: number;
  tardanzas: number;
  porcentajeAsistencia: number;
};

export type PersonaFichaEvento = {
  tipo: 'FAENA' | 'ASAMBLEA' | string;
  idEvento: number | string;
  idAsistencia: number | string;
  fecha: string;
  nombreEvento: string;
  estadoAsistencia: string;
  horaLlegada: string | null;
  generoObligacion: boolean;
  multaGenerada: boolean;
  montoRelacionado: number | null;
  idObligacion: number | string | null;
  relacionObligacionAmbigua: boolean;
};

export type PersonaFichaResumen = {
  persona: PersonaFichaPersona;
  resumenFinanciero: PersonaFichaFinanciero;
  resumenFaenas: PersonaFichaResumenAsistencia;
  resumenAsambleas: PersonaFichaResumenAsistencia;
  ultimosEventos: PersonaFichaEvento[];
};

export type PersonaAsistenciaFicha = {
  tipoEvento: 'FAENA' | 'ASAMBLEA' | string;
  idEvento: number | string;
  idAsistencia: number | string;
  fecha: string;
  nombreEvento: string;
  estado: string;
  horaLlegada: string | null;
  observacion: string | null;
  multaGenerada: boolean;
  montoMulta: number | null;
  idObligacion: number | string | null;
  estadoObligacion: string | null;
  relacionObligacionAmbigua: boolean;
};

export type PersonaObligacionEvento = {
  tipoEvento: 'FAENA' | 'ASAMBLEA' | string;
  idEvento: number | string;
  nombreEvento: string;
  fecha: string;
  idAsistencia: number | string | null;
};

export type PersonaObligacionFicha = {
  idObligacion: number | string;
  fecha: string;
  fechaEmision?: string | null;
  fechaVencimiento: string | null;
  periodo?: string | null;
  idConceptoCobro?: number | string;
  codigoConcepto?: string | null;
  concepto: string;
  tipoConcepto?: string | null;
  descripcion: string | null;
  importeOriginal: number;
  montoPagado?: number;
  montoExonerado?: number;
  montoCompensado?: number;
  saldoPendiente: number;
  estado: string;
  origen: string;
  tipoEvento: 'FAENA' | 'ASAMBLEA' | string | null;
  idEvento: number | string | null;
  idAsistencia: number | string | null;
  eventoRelacionado: PersonaObligacionEvento | null;
};

export type PersonaPagoFicha = {
  idObligacionPago: number | string;
  idObligacion: number | string;
  idMovimiento: number | string;
  fecha: string;
  importe: number;
  montoMovimiento?: number;
  idConceptoCobro?: number | string;
  codigoConcepto?: string | null;
  concepto: string;
  tipoConcepto?: string | null;
  medioPago: string;
  referencia: string | null;
  descripcion: string | null;
  observaciones?: string | null;
  estado: string;
  anulado: boolean;
  tipoEvento: 'FAENA' | 'ASAMBLEA' | string | null;
  idEvento: number | string | null;
};

export type PersonaTerrenoFicha = {
  idPersonaTerreno: number | string;
  idTerreno: number | string;
  codigoLote: string | null;
  manzana: string | null;
  numeroLote: string | null;
  descripcion: string;
  areaAproxM2: number | null;
  areaLegalM2: number | null;
  partidaRegistral: string | null;
  ubicacion: string | null;
  estado: string;
  tipoRelacion: string;
  porcentajeParticipacion: number | null;
  relacionPrincipal: boolean | null;
};

export type PersonaFichaPaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type PersonaFichaAsistenciasQuery = {
  tipo?: 'FAENA' | 'ASAMBLEA';
  estado?: string;
  anio?: number;
  page: number;
  limit: number;
};

export type PersonaFichaObligacionesQuery = {
  estado?: string;
  page: number;
  limit: number;
};

export type PersonaFichaPagosQuery = {
  page: number;
  limit: number;
};
