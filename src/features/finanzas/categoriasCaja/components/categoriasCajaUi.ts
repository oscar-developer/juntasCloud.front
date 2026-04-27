import type { ChipProps } from '@mui/material';
import type { CajaCategoria, CajaCategoriaTipo } from '../types';

export function getCategoriaCajaLabel(categoria: Pick<CajaCategoria, 'nombre'>) {
  return categoria.nombre.trim() || 'Categoría sin nombre';
}

export function getCategoriaCajaErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getTipoCategoriaCajaChipProps(tipo: CajaCategoriaTipo): Pick<ChipProps, 'color' | 'label'> {
  return tipo === 'INGRESO'
    ? { color: 'success', label: 'INGRESO' }
    : { color: 'warning', label: 'GASTO' };
}

export function getActivoChipProps(activo: boolean): Pick<ChipProps, 'color' | 'label'> {
  return activo ? { color: 'success', label: 'Activo' } : { color: 'default', label: 'Inactivo' };
}
