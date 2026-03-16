export type AsambleaTipo = 'ORDINARIA' | 'EXTRAORDINARIA';

export type AsambleaConvocatoria = 'PRIMERA' | 'SEGUNDA';

export type AsambleaEstado = 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'CERRADA';

export type Asamblea = {
  idAsamblea: number | string;
  idTenant: number | string;
  fechaProgramada: string;
  horaInicioReal?: string | null;
  horaFinReal?: string | null;
  tipo: AsambleaTipo;
  convocatoria?: AsambleaConvocatoria | null;
  estado: AsambleaEstado;
  temaPrincipal: string;
  lugar?: string | null;
  quorumRequerido?: number | null;
  quorumAlcanzado?: number | null;
  numeroActa?: string | null;
  observaciones?: string | null;
  cerradaAt?: string | null;
  cerradaByUser?: number | string | null;
};

export type AsambleaCreateDto = {
  fechaProgramada: string;
  horaInicioReal?: string;
  horaFinReal?: string;
  tipo: AsambleaTipo;
  convocatoria?: AsambleaConvocatoria;
  estado?: AsambleaEstado;
  temaPrincipal: string;
  lugar?: string;
  quorumRequerido?: number;
  quorumAlcanzado?: number;
  numeroActa?: string;
  observaciones?: string;
};

export type AsambleaUpdateDto = Partial<AsambleaCreateDto>;

export type AsambleaListQuery = {
  from?: string;
  to?: string;
  tipo?: AsambleaTipo | 'TODOS';
  convocatoria?: AsambleaConvocatoria | 'TODOS';
  estado?: AsambleaEstado | 'TODOS';
};
