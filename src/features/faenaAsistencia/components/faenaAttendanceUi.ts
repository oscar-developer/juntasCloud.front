import type { ChipProps } from '@mui/material';
import type { Persona } from '../../personas/types';
import type {
  FaenaAttendanceFilter,
  FaenaAttendanceStatus,
  FaenaParticipacion,
  FaenaParticipacionEstado,
} from '../types';

export function mapFaenaAttendanceRecordToStatus(
  participation?: Pick<FaenaParticipacion, 'estado'> | null,
): FaenaAttendanceStatus {
  if (!participation) {
    return 'unknown';
  }

  if (participation.estado === 'ASISTIO') {
    return 'present';
  }

  if (participation.estado === 'TARDE') {
    return 'late';
  }

  if (participation.estado === 'FALTO' || participation.estado === 'JUSTIFICADO') {
    return 'absent';
  }

  return 'unknown';
}

export function mapFaenaAttendanceStatusToEstado(
  status: Exclude<FaenaAttendanceStatus, 'unknown'>,
  previousEstado?: FaenaParticipacionEstado | null,
): FaenaParticipacionEstado {
  if (status === 'present') {
    return 'ASISTIO';
  }

  if (status === 'late') {
    return 'TARDE';
  }

  return previousEstado === 'JUSTIFICADO' ? 'JUSTIFICADO' : 'FALTO';
}

export function getFaenaAttendanceChipProps(
  status: FaenaAttendanceStatus,
): Pick<ChipProps, 'color' | 'label' | 'variant'> {
  if (status === 'present') {
    return {
      color: 'success',
      label: 'Presente',
      variant: 'outlined',
    };
  }

  if (status === 'absent') {
    return {
      color: 'error',
      label: 'Ausente',
      variant: 'outlined',
    };
  }

  if (status === 'late') {
    return {
      color: 'warning',
      label: 'Tarde',
      variant: 'outlined',
    };
  }

  return {
    color: 'default',
    label: 'Pendiente',
    variant: 'outlined',
  };
}

export function matchesFaenaAttendanceFilter(
  status: FaenaAttendanceStatus,
  filter: FaenaAttendanceFilter,
) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'unknown') {
    return status === 'unknown';
  }

  return status === filter;
}

export function getFaenaAttendanceFilterLabel(filter: FaenaAttendanceFilter) {
  if (filter === 'present') {
    return 'Presentes';
  }

  if (filter === 'late') {
    return 'Tardanzas';
  }

  if (filter === 'absent') {
    return 'Ausentes';
  }

  if (filter === 'unknown') {
    return 'Pendientes';
  }

  return 'Todos';
}

export function formatPersonaSecondaryText(persona: Persona) {
  const documentLabel = persona.dni?.trim() ? `DNI ${persona.dni.trim()}` : 'Sin DNI';
  const emailLabel = persona.email?.trim()
    ? persona.email.trim()
    : persona.tipoParticipante.replace(/_/g, ' ');
  return `${documentLabel} · ${emailLabel}`;
}

export function formatPersonaCompactFaenaAttendanceText(persona: Persona) {
  const documentLabel = persona.dni?.trim() ? `DNI ${persona.dni.trim()}` : 'Sin DNI';
  const participantLabel = persona.tipoParticipante.replace(/_/g, ' ');

  return `${documentLabel} · ${participantLabel}`;
}

export function formatFaenaAttendanceTime(value?: string | null) {
  if (!value) {
    return 'Sin hora';
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

export function formatFaenaAttendanceStatusLabel(
  status: FaenaAttendanceStatus,
  horaLlegada?: string | null,
) {
  if (status === 'late') {
    const hora = formatFaenaAttendanceTime(horaLlegada);
    return hora === 'Sin hora' ? 'Tarde' : `Tarde · ${hora}`;
  }

  if (status === 'present') {
    return 'Presente';
  }

  if (status === 'absent') {
    return 'Ausente';
  }

  return 'Pendiente';
}

export function formatFaenaAttendanceMobileStatusLabel(
  status: FaenaAttendanceStatus,
  rawStatus?: FaenaParticipacionEstado | null,
  horaLlegada?: string | null,
) {
  if (rawStatus === 'JUSTIFICADO') {
    return 'Justificado';
  }

  if (status === 'late') {
    const hora = formatFaenaAttendanceTime(horaLlegada);
    return hora === 'Sin hora' ? 'Tarde' : `Tarde · ${hora}`;
  }

  if (status === 'unknown') {
    return 'Pendiente';
  }

  return null;
}

export function createFaenaAttendanceTimestamp(date = new Date()) {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':');
}

export function getFaenaAttendanceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
