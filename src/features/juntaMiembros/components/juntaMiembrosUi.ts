import type { ChipProps } from '@mui/material';
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import type { Persona } from '../../personas/types';
import type { JuntaMiembro, JuntaMiembroCargo } from '../types';

export function formatJuntaMiembroDate(value?: string | null) {
  return value?.trim() ? value.slice(0, 10) : 'No registrado';
}

export function getJuntaMiembroPeriodoLabel(
  juntaMiembro: Pick<JuntaMiembro, 'fechaInicio' | 'fechaFin'>,
) {
  return `${formatJuntaMiembroDate(juntaMiembro.fechaInicio)} - ${formatJuntaMiembroDate(juntaMiembro.fechaFin)}`;
}

export function getCargoChipProps(
  cargo: JuntaMiembroCargo,
): Pick<ChipProps, 'color' | 'label'> {
  if (cargo === 'PRESIDENTE') {
    return { color: 'primary', label: 'PRESIDENTE' };
  }

  if (cargo === 'VICEPRESIDENTE') {
    return { color: 'info', label: 'VICEPRESIDENTE' };
  }

  if (cargo === 'SECRETARIO') {
    return { color: 'secondary', label: 'SECRETARIO' };
  }

  if (cargo === 'TESORERO') {
    return { color: 'warning', label: 'TESORERO' };
  }

  if (cargo === 'VOCAL') {
    return { color: 'default', label: 'VOCAL' };
  }

  return { color: 'default', label: 'OTRO' };
}

export function getPersonaFullName(
  persona: Pick<Persona, 'nombres' | 'apellidoPaterno' | 'apellidoMaterno'>,
) {
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

function findPersonaById(
  source: Persona[] | Record<string, Persona>,
  idPersona?: string | number | null,
) {
  const normalizedId = String(idPersona ?? '');

  if (Array.isArray(source)) {
    return source.find((item) => String(item.idPersona) === normalizedId);
  }

  return source[normalizedId];
}

export function getPersonaLabelById(
  source: Persona[] | Record<string, Persona>,
  idPersona?: string | number | null,
) {
  const persona = findPersonaById(source, idPersona);

  if (!persona) {
    return idPersona ? `Persona #${idPersona}` : 'Persona no identificada';
  }

  return getPersonaOptionLabel(persona);
}

export function getJuntaLabel(junta: Pick<JuntaDirectiva, 'idJunta' | 'nombre'>) {
  return junta.nombre.trim() || `Junta #${junta.idJunta}`;
}

export function getJuntaLabelById(
  juntas: JuntaDirectiva[],
  idJunta?: string | number | null,
) {
  const junta = juntas.find((item) => String(item.idJunta) === String(idJunta));

  if (!junta) {
    return idJunta ? `Junta #${idJunta}` : 'Junta no identificada';
  }

  return getJuntaLabel(junta);
}

export function getJuntaMiembroLabel(
  juntaMiembro: Pick<JuntaMiembro, 'cargo' | 'idPersona'>,
  personas: Persona[] | Record<string, Persona>,
) {
  return `${juntaMiembro.cargo} - ${getPersonaLabelById(personas, juntaMiembro.idPersona)}`;
}

export function getJuntaMiembroErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
