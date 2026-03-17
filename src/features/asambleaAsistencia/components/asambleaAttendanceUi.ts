import type { ChipProps } from '@mui/material';
import type { Persona } from '../../personas/types';
import type {
  AsambleaAttendanceRecord,
  AsistenciaAsambleaEstado,
  AttendanceFilter,
  AttendanceStatus,
} from '../types';

export function mapAttendanceRecordToStatus(
  attendance?: Pick<AsambleaAttendanceRecord, 'estado'> | null,
): AttendanceStatus {
  if (!attendance) {
    return 'unknown';
  }

  if (attendance.estado === 'ASISTIO' || attendance.estado === 'TARDE') {
    return 'present';
  }

  if (attendance.estado === 'FALTO' || attendance.estado === 'JUSTIFICADO') {
    return 'absent';
  }

  return 'unknown';
}

export function mapAttendanceStatusToEstado(
  status: Exclude<AttendanceStatus, 'unknown'>,
  previousEstado?: AsistenciaAsambleaEstado | null,
): AsistenciaAsambleaEstado {
  if (status === 'present') {
    return previousEstado === 'TARDE' ? 'TARDE' : 'ASISTIO';
  }

  return previousEstado === 'JUSTIFICADO' ? 'JUSTIFICADO' : 'FALTO';
}

export function getAttendanceChipProps(
  status: AttendanceStatus,
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

  return {
    color: 'default',
    label: 'Pendiente',
    variant: 'outlined',
  };
}

export function matchesAttendanceFilter(status: AttendanceStatus, filter: AttendanceFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'unknown') {
    return status === 'unknown';
  }

  return status === filter;
}

export function getAttendanceFilterLabel(filter: AttendanceFilter) {
  if (filter === 'present') {
    return 'Presentes';
  }

  if (filter === 'absent') {
    return 'Ausentes';
  }

  if (filter === 'unknown') {
    return 'Pendientes';
  }

  return 'Todos';
}

export function getAttendanceSearchText(persona: Persona) {
  return [
    persona.nombres,
    persona.apellidoPaterno,
    persona.apellidoMaterno,
    persona.dni ?? '',
    persona.email ?? '',
    persona.tipoParticipante,
  ]
    .join(' ')
    .toLowerCase();
}

export function formatPersonaSecondaryText(persona: Persona) {
  const documentLabel = persona.dni?.trim() ? `DNI ${persona.dni.trim()}` : 'Sin DNI';
  const emailLabel = persona.email?.trim() ? persona.email.trim() : persona.tipoParticipante.replace(/_/g, ' ');
  return `${documentLabel} · ${emailLabel}`;
}

export function formatAttendanceTime(value?: string | null) {
  if (!value) {
    return 'Sin hora';
  }

  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

export function createAttendanceTimestamp(date = new Date()) {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':');
}

export function getAttendanceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

