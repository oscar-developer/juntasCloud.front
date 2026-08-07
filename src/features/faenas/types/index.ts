export type FaenaTipo = 'ORDINARIA' | 'EXTRAORDINARIA' | 'RECUPERACION';

export type FaenaEstado = 'PROGRAMADA' | 'EJECUTADA' | 'CANCELADA';

export type Faena = {
  idFaena: number | string;
  idTenant: number | string;
  fechaProgramada: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  descripcion: string;
  lugar?: string | null;
  tipoFaena: FaenaTipo;
  esObligatoria: boolean;
  estado: FaenaEstado;
  montoMultaBase?: number | null;
  observaciones?: string | null;
};

export type FaenaCreateDto = {
  fechaProgramada: string;
  horaInicio?: string;
  horaFin?: string;
  descripcion: string;
  lugar?: string | null;
  tipoFaena?: FaenaTipo;
  esObligatoria?: boolean;
  estado?: FaenaEstado;
  montoMultaBase?: number | null;
  observaciones?: string | null;
};

export type FaenaUpdateDto = Partial<FaenaCreateDto>;

export type FaenaListQuery = {
  from?: string;
  to?: string;
  search?: string;
  tipoFaena?: FaenaTipo | 'TODOS';
  estado?: FaenaEstado | 'TODOS';
};

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
  tipoFaena?: FaenaTipo;
  tipo_faena?: FaenaTipo;
  esObligatoria?: boolean | string | number;
  es_obligatoria?: boolean | string | number;
  estado?: FaenaEstado;
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
