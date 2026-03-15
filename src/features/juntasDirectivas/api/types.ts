export type JuntaDirectivaApiShape = {
  idJunta?: number | string;
  id_junta?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  nombre?: string;
  fechaEleccion?: string;
  fecha_eleccion?: string;
  fechaInicio?: string;
  fecha_inicio?: string;
  fechaFin?: string;
  fecha_fin?: string;
  estado?: 'VIGENTE' | 'CESADA' | 'ANULADA' | 'PROYECTADA';
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
