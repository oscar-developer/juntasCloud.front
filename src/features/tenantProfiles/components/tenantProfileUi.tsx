import { Chip, type ChipProps } from '@mui/material';
import type { AccessLevel, TenantProfile } from '../types/tenantProfiles.types';

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  SIN_ACCESO: 'Sin acceso',
  SOLO_LECTURA: 'Solo lectura',
  ACCESO_TOTAL: 'Acceso total',
};

export function getStatusChipProps(activo: boolean): Pick<ChipProps, 'color' | 'label'> {
  return {
    color: activo ? 'success' : 'default',
    label: activo ? 'Activo' : 'Inactivo',
  };
}

export function StatusChip({ activo }: { activo: boolean }) {
  return <Chip size="small" variant="outlined" {...getStatusChipProps(activo)} />;
}

export function getProfileDescription(profile: TenantProfile) {
  return profile.descripcion?.trim() || 'Sin descripción';
}
