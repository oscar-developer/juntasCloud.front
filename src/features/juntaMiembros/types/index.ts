export type JuntaMiembroCargo =
  | 'PRESIDENTE'
  | 'VICEPRESIDENTE'
  | 'SECRETARIO'
  | 'TESORERO'
  | 'VOCAL'
  | 'OTRO';

export type JuntaMiembro = {
  idJuntaMiembro: number | string;
  idTenant: number | string;
  idJunta: number | string;
  idPersona: number | string;
  cargo: JuntaMiembroCargo;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string | null;
};

export type JuntaMiembroCreateDto = {
  idJunta: number | string;
  idPersona: number | string;
  cargo: JuntaMiembroCargo;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
};

export type JuntaMiembroUpdateDto = Partial<JuntaMiembroCreateDto>;

export type JuntaMiembrosVigentesFilter = 'TODOS' | 'true' | 'false';

export type JuntaMiembrosListQuery = {
  idJunta: number | string;
  idPersona?: number | string | 'TODOS';
  cargo?: JuntaMiembroCargo | 'TODOS';
  vigentes?: JuntaMiembrosVigentesFilter;
};
