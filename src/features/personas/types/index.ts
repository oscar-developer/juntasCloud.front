export type PersonaEstado = 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';

export type PersonaTipoParticipante = 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';

export type Persona = {
  idPersona: number | string;
  idTenant: number | string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string | null;
  telefono?: string | null;
  referenciaVivienda?: string | null;
  tipoParticipante: PersonaTipoParticipante;
  estado: PersonaEstado;
  fechaRegistro: string;
  observaciones?: string | null;
};

export type PersonaCreateDto = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string;
  telefono?: string;
  referenciaVivienda?: string;
  tipoParticipante: PersonaTipoParticipante;
  estado: PersonaEstado;
  fechaRegistro: string;
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
