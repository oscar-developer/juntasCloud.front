import type { ChipProps } from '@mui/material';

export function formatFichaDate(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatFichaMoney(value?: number | null) {
  return `S/ ${(value ?? 0).toFixed(2)}`;
}

export function formatFichaTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

export function formatFichaPercent(value?: number | null) {
  return `${Math.round(value ?? 0)}%`;
}

export function normalizeFichaLabel(value?: string | null) {
  if (!value) {
    return 'No registrado';
  }

  return value.replace(/_/g, ' ');
}

export function getAsistenciaStatusChipProps(status?: string | null): Pick<ChipProps, 'color' | 'label'> {
  if (status === 'ASISTIO') {
    return { color: 'success', label: 'Asistió' };
  }

  if (status === 'FALTO') {
    return { color: 'error', label: 'Falta' };
  }

  if (status === 'TARDE') {
    return { color: 'warning', label: 'Tardanza' };
  }

  if (status === 'JUSTIFICADO') {
    return { color: 'info', label: 'Justificado' };
  }

  return { color: 'default', label: 'Pendiente' };
}

export function getObligacionStatusChipProps(status?: string | null): Pick<ChipProps, 'color' | 'label'> {
  if (status === 'PAGADA' || status === 'COMPENSADA' || status === 'EXONERADA') {
    return { color: 'success', label: normalizeFichaLabel(status) };
  }

  if (status === 'PENDIENTE' || status === 'PARCIAL') {
    return { color: 'warning', label: normalizeFichaLabel(status) };
  }

  if (status === 'ANULADA') {
    return { color: 'error', label: 'Anulada' };
  }

  return { color: 'default', label: normalizeFichaLabel(status) };
}

export function getPagoStatusChipProps(status?: string | null): Pick<ChipProps, 'color' | 'label'> {
  if (status === 'REGISTRADO') {
    return { color: 'success', label: 'Registrado' };
  }

  if (status === 'ANULADO') {
    return { color: 'error', label: 'Anulado' };
  }

  return { color: 'default', label: normalizeFichaLabel(status) };
}
