import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { CajaMovimientoListItem } from '../types';
import { CajaMovimientosActions } from './CajaMovimientosActions';
import {
  formatMovimientoCurrency,
  formatMovimientoDate,
  getEstadoMovimientoChipProps,
  getMedioPagoLabel,
  getTipoMovimientoChipProps,
} from './cajaMovimientosUi';

type CajaMovimientosMobileListProps = {
  rows: CajaMovimientoListItem[];
  total: number;
  onEdit: (movimiento: CajaMovimientoListItem) => void;
  onAnular: (movimiento: CajaMovimientoListItem) => void;
};

export function CajaMovimientosMobileList({
  rows,
  total,
  onEdit,
  onAnular,
}: CajaMovimientosMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((movimiento, index) => {
        const displayNumber = Math.max(total - index, 1);

        return (
          <Card elevation={0} key={movimiento.idMovimiento}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                      #{displayNumber} {formatMovimientoCurrency(movimiento.monto)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {formatMovimientoDate(movimiento.fecha)} · {getMedioPagoLabel(movimiento.medioPago)}
                    </Typography>
                    <Typography color="text.secondary" noWrap title={movimiento.descripcion ?? ''} variant="body2">
                      {movimiento.descripcion || 'Sin descripción'}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                      <Chip size="small" variant="outlined" {...getTipoMovimientoChipProps(movimiento.tipo)} />
                      <Chip
                        size="small"
                        variant="outlined"
                        {...getEstadoMovimientoChipProps(movimiento.anulado)}
                      />
                    </Stack>
                  </Stack>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  <CajaMovimientosActions
                    movimiento={movimiento}
                    onAnular={onAnular}
                    onEdit={onEdit}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
