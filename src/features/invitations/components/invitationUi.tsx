import type { ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { InvitationRole, InvitationStatus } from '../types';

export function formatInvitationDate(value: string | null | undefined) {
  if (!value) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getInvitationRoleChipProps(
  role: InvitationRole,
): Pick<ChipProps, 'label' | 'color'> & { sx: ChipProps['sx'] } {
  if (role === 'ADMIN') {
    return {
      label: 'Administrador',
      color: 'primary',
      sx: {
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
      },
    };
  }

  return {
    label: 'Miembro',
    color: 'default',
    sx: {
      bgcolor: 'grey.100',
    },
  };
}

export function getInvitationStatusChipProps(
  status: InvitationStatus,
): Pick<ChipProps, 'label' | 'color'> & { sx: ChipProps['sx'] } {
  switch (status) {
    case 'ACCEPTED':
      return {
        label: 'Aceptada',
        color: 'success',
        sx: {
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
        },
      };
    case 'REVOKED':
      return {
        label: 'Rechazada',
        color: 'default',
        sx: {
          bgcolor: 'grey.100',
        },
      };
    case 'EXPIRED':
      return {
        label: 'Expirada',
        color: 'error',
        sx: {
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
        },
      };
    case 'PENDING':
    default:
      return {
        label: 'Pendiente',
        color: 'warning',
        sx: {
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
        },
      };
  }
}
