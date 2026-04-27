import type { ChipProps } from '@mui/material';
import type { CajaMedioPago, CajaMovimientoListItem, CajaMovimientoTipo } from '../types';

export function getCajaMovimientoLabel(movimiento: Pick<CajaMovimientoListItem, 'idMovimiento' | 'descripcion'>) {
  return movimiento.descripcion?.trim() || `Movimiento #${movimiento.idMovimiento}`;
}

export function getTipoMovimientoLabel(tipo: CajaMovimientoTipo) {
  return tipo === 'INGRESO' ? 'Ingreso' : 'Egreso';
}

export function getTipoMovimientoChipProps(tipo: CajaMovimientoTipo): Pick<ChipProps, 'color' | 'label'> {
  return {
    color: tipo === 'INGRESO' ? 'success' : 'warning',
    label: getTipoMovimientoLabel(tipo),
  };
}

export function getEstadoMovimientoChipProps(anulado: boolean): Pick<ChipProps, 'color' | 'label'> {
  return {
    color: anulado ? 'error' : 'success',
    label: anulado ? 'Anulado' : 'Vigente',
  };
}

export function getMedioPagoLabel(medioPago?: CajaMedioPago | null) {
  if (!medioPago) {
    return 'No registrado';
  }

  const labels: Record<CajaMedioPago, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    YAPE: 'Yape',
    PLIN: 'Plin',
    OTRO: 'Otro',
  };

  return labels[medioPago];
}

export function formatMovimientoDate(value: string) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatMovimientoCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    style: 'currency',
  }).format(value);
}

export function getCajaMovimientoErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
