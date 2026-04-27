export type ConceptoCobroTipo =
  | 'CUOTA_ORDINARIA'
  | 'CUOTA_EXTRAORDINARIA'
  | 'MULTA_FAENA'
  | 'MULTA_ASAMBLEA'
  | 'APORTE'
  | 'OTRO';

export type ConceptoCobro = {
  idTenant: number;
  idConceptoCobro: number;
  nombre: string;
  tipo: ConceptoCobroTipo;
  activo: boolean;
  requierePeriodo: boolean;
  observaciones: string | null;
};

export type ConceptoCobroCreateDto = {
  nombre: string;
  tipo: ConceptoCobroTipo;
  activo?: boolean;
  requierePeriodo?: boolean;
  observaciones?: string | null;
};

export type ConceptoCobroUpdateDto = Partial<ConceptoCobroCreateDto>;

export type ConceptoCobroListQuery = {
  search?: string;
  tipo?: ConceptoCobroTipo | 'TODOS';
  activo?: boolean | 'TODOS';
  requierePeriodo?: boolean | 'TODOS';
};

export type ConceptoCobroApiShape = {
  idTenant: number;
  idConceptoCobro: number;
  nombre: string;
  tipo: ConceptoCobroTipo;
  activo: boolean;
  requierePeriodo: boolean;
  observaciones: string | null;
};
