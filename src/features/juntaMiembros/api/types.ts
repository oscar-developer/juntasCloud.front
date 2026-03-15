export type JuntaMiembroApiShape = {
  idJuntaMiembro?: number | string;
  id_junta_miembro?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  idJunta?: number | string;
  id_junta?: number | string;
  idPersona?: number | string;
  id_persona?: number | string;
  cargo?: 'PRESIDENTE' | 'VICEPRESIDENTE' | 'SECRETARIO' | 'TESORERO' | 'VOCAL' | 'OTRO';
  fechaInicio?: string;
  fecha_inicio?: string;
  fechaFin?: string;
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
