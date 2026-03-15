export type BienApiShape = {
  idBien?: number | string;
  id_bien?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  descripcion?: string;
  descripcion_bien?: string;
  tipo?: string;
  cantidad?: number | string | null;
  valorEstimado?: number | string | null;
  valor_estimado?: number | string | null;
  ubicacion?: string;
  fechaAlta?: string;
  fecha_alta?: string;
  fechaBaja?: string | null;
  fecha_baja?: string | null;
  estado?: 'BUENO' | 'REGULAR' | 'MALO' | 'DADO_DE_BAJA';
  observaciones?: string | null;
};

export type BienesListEnvelope =
  | BienApiShape[]
  | {
      items?: BienApiShape[];
      data?: BienApiShape[] | { items?: BienApiShape[] };
      results?: BienApiShape[];
    };
