import type { ChipProps } from '@mui/material';
import axios from 'axios';
import type { Persona } from '../../personas/types';
import type { Faena } from '../../faenas/types';
import type { FaenaParticipacion, FaenaParticipacionEstado } from '../types';

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

  return normalized % 1 === 0 ? `S/ ${normalized.toFixed(0)}` : `S/ ${normalized.toFixed(2)}`;
}

export function getPersonaFullName(persona: Pick<Persona, 'nombres' | 'apellidoPaterno' | 'apellidoMaterno'>) {
  const fullName = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');

  return fullName || 'Persona sin nombre';
}

export function getPersonaOptionLabel(persona: Persona) {
  const fullName = getPersonaFullName(persona);
  const dni = persona.dni?.trim();
  return dni ? `${fullName} - DNI ${dni}` : fullName;
}

export function getPersonaLabelById(
  source: Persona[] | Record<string, Persona>,
  idPersona?: string | number | null,
) {
  const normalizedId = String(idPersona ?? '');
  const persona = Array.isArray(source)
    ? source.find((item) => String(item.idPersona) === normalizedId)
    : source[normalizedId];

  if (!persona) {
    return idPersona ? `Persona #${idPersona}` : 'Persona no identificada';
  }

  return getPersonaOptionLabel(persona);
}

export function getFaenaLabelById(faenas: Faena[], idFaena?: string | number | null) {
  const faena = faenas.find((item) => String(item.idFaena) === String(idFaena));

  if (!faena) {
    return idFaena ? `Faena #${idFaena}` : 'Faena no identificada';
  }

  return faena.descripcion?.trim() || `Faena #${faena.idFaena}`;
}

export function formatFaenaParticipacionTime(value?: string | null) {
  return extractTimeToken(value) || 'Sin hora';
}

export function formatFaenaParticipacionDateTime(value?: string | null) {
  if (!value) {
    return 'No registrado';
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

export function getFaenaParticipacionEstadoChipProps(
  estado: FaenaParticipacionEstado,
): Pick<ChipProps, 'color' | 'label'> {
  switch (estado) {
    case 'ASISTIO':
      return { color: 'success', label: 'ASISTIÓ' };
    case 'TARDE':
      return { color: 'warning', label: 'TARDE' };
    case 'FALTO':
      return { color: 'error', label: 'FALTÓ' };
    case 'JUSTIFICADO':
      return { color: 'info', label: 'JUSTIFICADO' };
    case 'PENDIENTE':
    default:
      return { color: 'default', label: 'PENDIENTE' };
  }
}

export function getAnuladoChipProps(anulado: boolean): Pick<ChipProps, 'color' | 'label'> {
  return anulado
    ? { color: 'error', label: 'ANULADO' }
    : { color: 'success', label: 'ACTIVO' };
}

export function getFaenaParticipacionMultaLabel(participacion: Pick<FaenaParticipacion, 'multaGenerada' | 'montoMulta'>) {
  if (!participacion.multaGenerada) {
    return 'Multa: No';
  }

  return `Multa: Sí · ${formatCurrencyValue(participacion.montoMulta)}`;
}

export function getFaenaParticipacionLabel(
  participacion: Pick<FaenaParticipacion, 'idPersona' | 'estado'>,
  personas: Persona[] | Record<string, Persona>,
) {
  return `${getPersonaLabelById(personas, participacion.idPersona)} · ${participacion.estado}`;
}

export function getFaenaParticipacionErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === 'object') {
      const candidate = responseData as { message?: string | string[]; error?: string };

      if (Array.isArray(candidate.message) && candidate.message.length > 0) {
        return candidate.message.join(' ');
      }

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
