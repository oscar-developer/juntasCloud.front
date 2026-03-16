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
  lugar?: string;
  tipoFaena: FaenaTipo;
  esObligatoria: boolean;
  estado: FaenaEstado;
  montoMultaBase?: number;
  observaciones?: string;
};

export type FaenaUpdateDto = Partial<FaenaCreateDto>;

export type FaenaListQuery = {
  from?: string;
  to?: string;
  search?: string;
  tipoFaena?: FaenaTipo | 'TODOS';
  estado?: FaenaEstado | 'TODOS';
};
