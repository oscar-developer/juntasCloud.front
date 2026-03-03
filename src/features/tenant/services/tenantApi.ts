import { getTenantById as getTenantByIdRequest } from '../../juntas/services/juntasApi';
import type { TenantSummary } from '../types';

export async function getTenantById(
  tenantId: string | number,
  signal?: AbortSignal,
): Promise<TenantSummary> {
  const response = await getTenantByIdRequest(tenantId, signal);

  return {
    idTenant: response.idTenant ?? tenantId,
    nombre: response.nombre?.trim() || `Junta ${tenantId}`,
    estado: response.estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
    observaciones: response.observaciones ?? null,
    ownerUserId: response.ownerUserId ?? null,
  };
}
