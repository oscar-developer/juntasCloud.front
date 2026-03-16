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
  tipo?: 'ORDINARIA' | 'EXTRAORDINARIA';
  convocatoria?: 'PRIMERA' | 'SEGUNDA' | null;
  estado?: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'CERRADA';
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
