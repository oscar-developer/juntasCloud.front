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

function toTitleCaseWord(value: string) {
  return value
    .toLocaleLowerCase('es-PE')
    .replace(/(^|[-'`])(\p{L})/gu, (_match, separator: string, letter: string) => {
      return `${separator}${letter.toLocaleUpperCase('es-PE')}`;
    });
}

export function getDisplayFullName(
  persona: Pick<Persona, 'nombres' | 'apellidoPaterno' | 'apellidoMaterno'>,
) {
  return getFullName(persona)
    .split(/\s+/)
    .filter(Boolean)
    .map(toTitleCaseWord)
    .join(' ');
}

export function getEstadoChipProps(estado: PersonaEstado): Pick<ChipProps, 'color' | 'label'> {
  if (estado === 'ACTIVO') {
    return { color: 'success', label: 'ACTIVO' };
  }

  if (estado === 'SUSPENDIDO') {
    return { color: 'warning', label: 'SUSPENDIDO' };
  }

  if (estado === 'FALLECIDO') {
    return { color: 'error', label: 'FALLECIDO' };
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
