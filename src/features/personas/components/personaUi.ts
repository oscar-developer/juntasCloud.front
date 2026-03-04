import type { ChipProps } from '@mui/material';
import type { Persona, PersonaEstado, PersonaTipoParticipante } from '../types';

export function getFullName(
  persona: Pick<Persona, 'nombres' | 'apellidoPaterno' | 'apellidoMaterno'>,
) {
  return [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
}

export function getEstadoChipProps(estado: PersonaEstado): Pick<ChipProps, 'color' | 'label'> {
  if (estado === 'ACTIVO') {
    return { color: 'success', label: 'ACTIVO' };
  }

  if (estado === 'SUSPENDIDO') {
    return { color: 'warning', label: 'SUSPENDIDO' };
  }

  return { color: 'default', label: 'RETIRADO' };
}

export function getTipoChipProps(
  tipoParticipante: PersonaTipoParticipante,
): Pick<ChipProps, 'color' | 'label'> {
  if (tipoParticipante === 'PADRONADO') {
    return { color: 'primary', label: 'PADRONADO' };
  }

  if (tipoParticipante === 'INVITADO') {
    return { color: 'secondary', label: 'INVITADO' };
  }

  return { color: 'default', label: 'NO PADRONADO' };
}

export function getPersonaErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
