export type BienEstado = 'BUENO' | 'REGULAR' | 'MALO' | 'DADO_DE_BAJA';

export type Bien = {
  idBien: number | string;
  idTenant: number | string;
  descripcion: string;
  tipo: string;
  cantidad: number;
  valorEstimado: number;
  ubicacion: string;
  fechaAlta: string;
  fechaBaja?: string | null;
  estado: BienEstado;
  observaciones?: string | null;
};

export type BienCreateDto = {
  descripcion: string;
  tipo: string;
  cantidad: number;
  valorEstimado: number;
  ubicacion: string;
  fechaAlta: string;
  fechaBaja?: string;
  estado: BienEstado;
  observaciones?: string;
};

export type BienUpdateDto = Partial<BienCreateDto>;

export type BienListQuery = {
  search?: string;
  tipo?: string;
  estado?: BienEstado | 'TODOS';
  page: number;
  pageSize: number;
};

export type BienesListResponse = {
  items: Bien[];
  total: number;
};
