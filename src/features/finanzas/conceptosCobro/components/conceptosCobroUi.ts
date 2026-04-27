import type { ChipProps } from '@mui/material';
import type { ConceptoCobro, ConceptoCobroTipo } from '../types';

export const CONCEPTO_COBRO_TIPO_LABELS: Record<ConceptoCobroTipo, string> = {
  CUOTA_ORDINARIA: 'Cuota ordinaria',
  CUOTA_EXTRAORDINARIA: 'Cuota extraordinaria',
  MULTA_FAENA: 'Multa faena',
  MULTA_ASAMBLEA: 'Multa asamblea',
  APORTE: 'Aporte',
  OTRO: 'Otro',
};

export function getConceptoCobroLabel(concepto: Pick<ConceptoCobro, 'nombre'>) {
  return concepto.nombre.trim() || 'Concepto sin nombre';
}

export function getConceptoCobroErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getTipoConceptoCobroChipProps(tipo: ConceptoCobroTipo): Pick<ChipProps, 'color' | 'label'> {
  if (tipo === 'CUOTA_ORDINARIA' || tipo === 'CUOTA_EXTRAORDINARIA') {
    return { color: 'primary', label: CONCEPTO_COBRO_TIPO_LABELS[tipo] };
  }

  if (tipo === 'MULTA_FAENA' || tipo === 'MULTA_ASAMBLEA') {
    return { color: 'warning', label: CONCEPTO_COBRO_TIPO_LABELS[tipo] };
  }

  return { color: 'default', label: CONCEPTO_COBRO_TIPO_LABELS[tipo] };
}

export function getActivoChipProps(activo: boolean): Pick<ChipProps, 'color' | 'label'> {
  return activo ? { color: 'success', label: 'Activo' } : { color: 'default', label: 'Inactivo' };
}

export function getRequierePeriodoChipProps(requierePeriodo: boolean): Pick<ChipProps, 'color' | 'label'> {
  return requierePeriodo
    ? { color: 'info', label: 'Requiere periodo' }
    : { color: 'default', label: 'Sin periodo' };
}
