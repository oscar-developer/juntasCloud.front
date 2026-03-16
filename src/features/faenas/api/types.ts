export type FaenaApiShape = {
  idFaena?: number | string;
  id_faena?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  fechaProgramada?: string;
  fecha_programada?: string;
  horaInicio?: string | null;
  hora_inicio?: string | null;
  horaFin?: string | null;
  hora_fin?: string | null;
  descripcion?: string;
  lugar?: string | null;
  tipoFaena?: 'ORDINARIA' | 'EXTRAORDINARIA' | 'RECUPERACION';
  tipo_faena?: 'ORDINARIA' | 'EXTRAORDINARIA' | 'RECUPERACION';
  esObligatoria?: boolean | string | number;
  es_obligatoria?: boolean | string | number;
  estado?: 'PROGRAMADA' | 'EJECUTADA' | 'CANCELADA';
  montoMultaBase?: number | string | null;
  monto_multa_base?: number | string | null;
  observaciones?: string | null;
};

export type FaenasListEnvelope =
  | FaenaApiShape[]
  | {
      items?: FaenaApiShape[];
      data?: FaenaApiShape[] | { items?: FaenaApiShape[] };
      results?: FaenaApiShape[];
    };
