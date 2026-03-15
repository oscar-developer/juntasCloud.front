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
  estado: PersonaEstado;
  fechaRegistro: string;
  fechaBaja?: string;
  observaciones?: string;
};

export type PersonaUpdateDto = Partial<PersonaCreateDto>;

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
