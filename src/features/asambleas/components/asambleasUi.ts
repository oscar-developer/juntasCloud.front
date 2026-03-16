import type { ChipProps } from '@mui/material';
import axios from 'axios';
import type { Asamblea, AsambleaConvocatoria, AsambleaEstado, AsambleaTipo } from '../types';

function extractTimeToken(value?: string | null) {
  if (!value) {
    return '';
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

function formatNumberValue(value?: number | null) {
  if (value === null || value === undefined) {
    return 'No registrado';
  }

  return Number(value).toString();
}

export function formatAsambleaDate(value?: string | null) {
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

export function formatAsambleaDateTime(value?: string | null) {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatAsambleaDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function formatAsambleaTimeInput(value?: string | null) {
  return extractTimeToken(value);
}

export function formatAsambleaTime(value?: string | null) {
  return extractTimeToken(value) || 'No registrada';
}

export function getAsambleaRealScheduleLabel(asamblea: Asamblea) {
  const start = extractTimeToken(asamblea.horaInicioReal);
  const end = extractTimeToken(asamblea.horaFinReal);

  if (start && end) {
    return `${start} - ${end}`;
  }

  if (start) {
    return `Desde ${start}`;
  }

  if (end) {
    return `Hasta ${end}`;
  }

  return 'Sin horario real';
}

export function getAsambleaTipoChipProps(tipo: AsambleaTipo): Pick<ChipProps, 'color' | 'label'> {
  switch (tipo) {
    case 'EXTRAORDINARIA':
      return { color: 'warning', label: 'EXTRAORDINARIA' };
    case 'ORDINARIA':
    default:
      return { color: 'primary', label: 'ORDINARIA' };
  }
}

export function getAsambleaConvocatoriaChipProps(
  convocatoria?: AsambleaConvocatoria | null,
): Pick<ChipProps, 'color' | 'label'> {
  switch (convocatoria) {
    case 'SEGUNDA':
      return { color: 'secondary', label: 'SEGUNDA' };
    case 'PRIMERA':
      return { color: 'info', label: 'PRIMERA' };
    default:
      return { color: 'default', label: 'SIN CONVOCATORIA' };
  }
}

export function getAsambleaEstadoChipProps(estado: AsambleaEstado): Pick<ChipProps, 'color' | 'label'> {
  switch (estado) {
    case 'REALIZADA':
      return { color: 'success', label: 'REALIZADA' };
    case 'CANCELADA':
      return { color: 'error', label: 'CANCELADA' };
    case 'CERRADA':
      return { color: 'info', label: 'CERRADA' };
    case 'PROGRAMADA':
    default:
      return { color: 'secondary', label: 'PROGRAMADA' };
  }
}

export function getAsambleaQuorumLabel(asamblea: Asamblea) {
  const reached = formatNumberValue(asamblea.quorumAlcanzado);
  const required = formatNumberValue(asamblea.quorumRequerido);

  if (asamblea.quorumAlcanzado === null || asamblea.quorumAlcanzado === undefined) {
    return `Quórum req.: ${required}`;
  }

  return `Quórum: ${reached} / ${required}`;
}

export function getAsambleaLabel(asamblea: Asamblea) {
  return `${asamblea.temaPrincipal || 'Asamblea sin tema'} · ${formatAsambleaDate(asamblea.fechaProgramada)}`;
}

export function getAsambleaErrorMessage(error: unknown, fallback: string) {
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
