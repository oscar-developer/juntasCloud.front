import type { ChipProps } from '@mui/material';
import axios from 'axios';
import type { Faena, FaenaEstado, FaenaTipo } from '../types';

function extractTimeToken(value?: string | null) {
  if (!value) {
    return '';
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

function formatCurrencyValue(value?: number | null) {
  if (value === null || value === undefined) {
    return 'No definida';
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    return 'No definida';
  }

  return normalized % 1 === 0
    ? `S/ ${normalized.toFixed(0)}`
    : `S/ ${normalized.toFixed(2)}`;
}

export function formatFaenaDate(value?: string | null) {
  if (!value) {
    return 'No registrada';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatFaenaDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function formatFaenaTimeInput(value?: string | null) {
  return extractTimeToken(value);
}

export function formatFaenaTime(value?: string | null) {
  return extractTimeToken(value) || 'No registrada';
}

export function getFaenaScheduleLabel(faena: Faena) {
  const start = extractTimeToken(faena.horaInicio);
  const end = extractTimeToken(faena.horaFin);

  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) {
    return `Desde ${start}`;
  }

  if (end) {
    return `Hasta ${end}`;
  }

  return 'Sin horario';
}

export function getFaenaTipoChipProps(tipoFaena: FaenaTipo): Pick<ChipProps, 'color' | 'label'> {
  switch (tipoFaena) {
    case 'EXTRAORDINARIA':
      return { color: 'warning', label: 'EXTRAORDINARIA' };
    case 'RECUPERACION':
      return { color: 'info', label: 'RECUPERACION' };
    case 'ORDINARIA':
    default:
      return { color: 'primary', label: 'ORDINARIA' };
  }
}

export function getFaenaEstadoChipProps(estado: FaenaEstado): Pick<ChipProps, 'color' | 'label'> {
  switch (estado) {
    case 'EJECUTADA':
      return { color: 'success', label: 'EJECUTADA' };
    case 'CANCELADA':
      return { color: 'error', label: 'CANCELADA' };
    case 'PROGRAMADA':
    default:
      return { color: 'secondary', label: 'PROGRAMADA' };
  }
}

export function getFaenaMandatoryLabel(value: boolean) {
  return value ? 'Si' : 'No';
}

export function getFaenaMultaLabel(value?: number | null) {
  return `Multa: ${formatCurrencyValue(value)}`;
}

export function getFaenaLabel(faena: Faena) {
  return `${faena.descripcion || 'Faena sin descripcion'} · ${formatFaenaDate(faena.fechaProgramada)}`;
}

export function getFaenaErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === 'object') {
      const candidate = responseData as { message?: string; error?: string };

      if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message;
      }

      if (typeof candidate.error === 'string' && candidate.error.trim()) {
        return candidate.error;
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
