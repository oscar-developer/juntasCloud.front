import type { ChipProps } from '@mui/material';
import type { JuntaDirectiva, JuntaDirectivaEstado } from '../types';

export function getJuntaDirectivaLabel(junta: Pick<JuntaDirectiva, 'nombre'>) {
  return junta.nombre.trim() || 'Junta directiva sin nombre';
}

export function formatJuntaDate(value?: string | null) {
  return value?.trim() ? value.slice(0, 10) : 'No registrado';
}

export function getPeriodoLabel(junta: Pick<JuntaDirectiva, 'fechaInicio' | 'fechaFin'>) {
  return `${formatJuntaDate(junta.fechaInicio)} - ${formatJuntaDate(junta.fechaFin)}`;
}

export function getEstadoChipProps(
  estado: JuntaDirectivaEstado,
): Pick<ChipProps, 'color' | 'label'> {
  if (estado === 'VIGENTE') {
    return { color: 'success', label: 'VIGENTE' };
  }

  if (estado === 'PROYECTADA') {
    return { color: 'info', label: 'PROYECTADA' };
  }

  if (estado === 'ANULADA') {
    return { color: 'error', label: 'ANULADA' };
  }

  return { color: 'default', label: 'CESADA' };
}

export function getJuntasDirectivasErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
