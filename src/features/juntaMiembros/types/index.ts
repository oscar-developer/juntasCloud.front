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
  fechaFin: string | null;
  observaciones?: string | null;
};

export type JuntaMiembroCreateDto = {
  idJunta: number | string;
  idPersona: number | string;
  cargo: JuntaMiembroCargo;
  fechaInicio: string;
  fechaFin?: string | null;
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

export type JuntaMiembrosListResponse = JuntaMiembro[];

export type JuntaMiembroApiShape = {
  idJuntaMiembro?: number | string;
  id_junta_miembro?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  idJunta?: number | string;
  id_junta?: number | string;
  idPersona?: number | string;
  id_persona?: number | string;
  cargo?: JuntaMiembroCargo;
  fechaInicio?: string;
  fecha_inicio?: string;
  fechaFin?: string | null;
  fecha_fin?: string;
  observaciones?: string | null;
};

export type JuntaMiembrosListEnvelope =
  | JuntaMiembroApiShape[]
  | {
      items?: JuntaMiembroApiShape[];
      data?: JuntaMiembroApiShape[] | { items?: JuntaMiembroApiShape[] };
      results?: JuntaMiembroApiShape[];
    };
