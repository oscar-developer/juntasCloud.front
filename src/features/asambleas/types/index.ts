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

export type AsambleaApiShape = {
  idAsamblea?: number | string;
  id_asamblea?: number | string;
  idTenant?: number | string;
  id_tenant?: number | string;
  fechaProgramada?: string;
  fecha_programada?: string;
  horaInicioReal?: string | null;
  hora_inicio_real?: string | null;
  horaFinReal?: string | null;
  hora_fin_real?: string | null;
  tipo?: AsambleaTipo;
  convocatoria?: AsambleaConvocatoria | null;
  estado?: AsambleaEstado;
  temaPrincipal?: string;
  tema_principal?: string;
  lugar?: string | null;
  quorumRequerido?: number | string | null;
  quorum_requerido?: number | string | null;
  quorumAlcanzado?: number | string | null;
  quorum_alcanzado?: number | string | null;
  numeroActa?: string | null;
  numero_acta?: string | null;
  observaciones?: string | null;
  cerradaAt?: string | null;
  cerrada_at?: string | null;
  cerradaByUser?: number | string | null;
  cerrada_by_user?: number | string | null;
};

export type AsambleasListEnvelope =
  | AsambleaApiShape[]
  | {
      items?: AsambleaApiShape[];
      data?: AsambleaApiShape[] | { items?: AsambleaApiShape[] };
      results?: AsambleaApiShape[];
    };
