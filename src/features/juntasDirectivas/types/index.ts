export type JuntaDirectivaEstado = 'VIGENTE' | 'CESADA' | 'ANULADA' | 'PROYECTADA';

export type JuntaDirectiva = {
  idJunta: number | string;
  idTenant: number | string;
  nombre: string;
  fechaEleccion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: JuntaDirectivaEstado;
  documentoSustento?: string | null;
  observaciones?: string | null;
};

export type JuntaDirectivaCreateDto = {
  nombre: string;
  fechaEleccion: string;
  fechaInicio: string;
  fechaFin: string;
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
