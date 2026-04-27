export type CajaCategoriaTipo = 'INGRESO' | 'GASTO';

export type CajaCategoria = {
  idTenant: number;
  idCategoriaCaja: number;
  nombre: string;
  tipo: CajaCategoriaTipo;
  activo: boolean;
};

export type CajaCategoriaCreateDto = {
  nombre: string;
  tipo: CajaCategoriaTipo;
  activo?: boolean;
};

export type CajaCategoriaUpdateDto = Partial<CajaCategoriaCreateDto>;

export type CajaCategoriaListQuery = {
  search?: string;
  tipo?: CajaCategoriaTipo | 'TODOS';
  activo?: boolean | 'TODOS';
};

export type CajaCategoriaApiShape = {
  idTenant: number;
  idCategoriaCaja: number;
  nombre: string;
  tipo: CajaCategoriaTipo;
  activo: boolean;
};
