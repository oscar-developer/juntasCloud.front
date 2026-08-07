export type JuntaDirectivaEstado = 'VIGENTE' | 'CESADA' | 'ANULADA' | 'PROYECTADA';

export type JuntaDirectiva = {
  idJunta: number | string;
  idTenant: number | string;
  nombre: string;
  fechaEleccion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  estado: JuntaDirectivaEstado;
  documentoSustento?: string | null;
  observaciones?: string | null;
};

export type JuntaDirectivaCreateDto = {
  nombre: string;
  fechaEleccion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  estado: JuntaDirectivaEstado;
  documentoSustento?: string;
  observaciones?: string;
};

export type JuntaDirectivaUpdateDto = Partial<JuntaDirectivaCreateDto>;

export type JuntasDirectivasListQuery = {
  estado?: JuntaDirectivaEstado | 'TODOS';
  from?: string;
  to?: string;
};

export type JuntasDirectivasListResponse = JuntaDirectiva[];

export type JuntaDirectivaApiShape = {
  idJunta?: number | string;
  id_junta?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  nombre?: string;
  fechaEleccion?: string | null;
  fecha_eleccion?: string;
  fechaInicio?: string;
  fecha_inicio?: string;
  fechaFin?: string | null;
  fecha_fin?: string;
  estado?: JuntaDirectivaEstado;
  documentoSustento?: string | null;
  documento_sustento?: string | null;
  observaciones?: string | null;
};

export type JuntasDirectivasListEnvelope =
  | JuntaDirectivaApiShape[]
  | {
      items?: JuntaDirectivaApiShape[];
      data?: JuntaDirectivaApiShape[] | { items?: JuntaDirectivaApiShape[] };
      results?: JuntaDirectivaApiShape[];
    };
