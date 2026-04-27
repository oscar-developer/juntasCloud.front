export type CajaMovimientoTipo = 'INGRESO' | 'GASTO';

export type CajaMedioPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN' | 'OTRO';

export type CajaMovimiento = {
  idTenant: number;
  idMovimiento: number;
  fecha: string;
  tipo: CajaMovimientoTipo;
  monto: number;
  idCategoriaCaja: number;
  categoriaNombre: string;
  idPersona: number | null;
  idFaena: number | null;
  idAsamblea: number | null;
  idBien: number | null;
  idUser: number;
  descripcion: string | null;
  medioPago: CajaMedioPago;
  docReferencia: string | null;
  observaciones: string | null;
  createdAt: string;
  createdByUser: number;
  updatedAt: string | null;
  updatedByUser: number | null;
  anulado: boolean;
  anuladoAt: string | null;
  anuladoByUser: number | null;
  motivoAnulacion: string | null;
};

export type CajaMovimientoListItem = {
  idMovimiento: number;
  fecha: string;
  tipo: CajaMovimientoTipo;
  monto: number;
  descripcion: string | null;
  medioPago: CajaMedioPago | null;
  anulado: boolean;
};

export type CreateMovimientoDto = {
  fecha: string;
  tipo: CajaMovimientoTipo;
  monto: number;
  idCategoriaCaja: number;
  medioPago: CajaMedioPago;
  idPersona: number | null;
  idBien: number | null;
  descripcion: string | null;
};

export type UpdateMovimientoDto = Partial<CreateMovimientoDto>;

export type AnularMovimientoDto = {
  motivoAnulacion: string;
};

export type CajaMovimientosQuery = {
  from?: string;
  to?: string;
  tipo?: CajaMovimientoTipo | 'TODOS';
  idCategoriaCaja?: number | null;
  medioPago?: CajaMedioPago | 'TODOS';
  anulado?: boolean | 'TODOS';
  idPersona?: number | null;
  idUser?: number | null;
  page: number;
  limit: number;
};

export type CajaMovimientosListResponse = {
  items: CajaMovimientoListItem[];
  total: number;
};

export type CajaCategoriaOption = {
  idCategoriaCaja: number;
  nombre: string;
  tipo: CajaMovimientoTipo;
  activo: boolean;
};

export type CajaCategoriasQuery = {
  search?: string;
  tipo?: CajaMovimientoTipo | 'TODOS';
  activo?: boolean | 'TODOS';
};

export type CajaMovimientoApiShape = {
  idTenant?: number;
  idMovimiento?: number;
  fecha?: string;
  tipo?: CajaMovimientoTipo;
  monto?: number | string;
  idCategoriaCaja?: number | string;
  categoriaNombre?: string;
  idPersona?: number | string | null;
  idFaena?: number | string | null;
  idAsamblea?: number | string | null;
  idBien?: number | string | null;
  idUser?: number;
  descripcion?: string | null;
  medioPago?: CajaMedioPago;
  docReferencia?: string | null;
  observaciones?: string | null;
  createdAt?: string;
  createdByUser?: number;
  updatedAt?: string | null;
  updatedByUser?: number | null;
  anulado?: boolean;
  anuladoAt?: string | null;
  anuladoByUser?: number | null;
  motivoAnulacion?: string | null;
};

export type CajaMovimientoListApiShape = {
  idMovimiento?: number;
  fecha?: string;
  tipo?: CajaMovimientoTipo;
  monto?: number | string;
  descripcion?: string | null;
  medioPago?: CajaMedioPago | null;
  anulado?: boolean;
};

export type CajaCategoriaApiShape = {
  idCategoriaCaja?: number | string;
  nombre?: string;
  tipo?: CajaMovimientoTipo;
  activo?: boolean;
};
