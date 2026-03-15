import type { ChipProps } from '@mui/material';
import type { Bien, BienEstado } from '../types';

const numberFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function getBienLabel(bien: Pick<Bien, 'descripcion'>) {
  return bien.descripcion.trim() || 'Bien sin descripcion';
}

export function formatBienNumber(value: number) {
  return numberFormatter.format(value);
}

export function getEstadoChipProps(estado: BienEstado): Pick<ChipProps, 'color' | 'label'> {
  if (estado === 'BUENO') {
    return { color: 'success', label: 'BUENO' };
  }

  if (estado === 'REGULAR') {
    return { color: 'warning', label: 'REGULAR' };
  }

  if (estado === 'MALO') {
    return { color: 'error', label: 'MALO' };
  }

  return { color: 'default', label: 'DADO_DE_BAJA' };
}

export function getBienErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
