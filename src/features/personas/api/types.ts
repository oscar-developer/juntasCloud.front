export type PersonaApiShape = {
  idPersona?: number | string;
  id_persona?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  nombres?: string;
  apellidoPaterno?: string;
  apellido_paterno?: string;
  apellidoMaterno?: string;
  apellido_materno?: string;
  dni?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  referenciaVivienda?: string | null;
  referencia_vivienda?: string | null;
  tipoParticipante?: 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';
  tipo_participante?: 'PADRONADO' | 'NO_PADRONADO' | 'INVITADO';
  estado?: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO' | 'FALLECIDO';
  fechaRegistro?: string;
  fecha_registro?: string;
  fechaBaja?: string | null;
  fecha_baja?: string | null;
  observaciones?: string | null;
};

export type PersonasListEnvelope =
  | PersonaApiShape[]
  | {
      items?: PersonaApiShape[];
      data?: PersonaApiShape[] | { items?: PersonaApiShape[] };
      results?: PersonaApiShape[];
    };
