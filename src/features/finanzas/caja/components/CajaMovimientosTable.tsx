import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import type { CajaMovimientoListItem } from '../types';
import { CajaMovimientosActions } from './CajaMovimientosActions';
import {
  formatMovimientoCurrency,
  formatMovimientoDate,
  getEstadoMovimientoChipProps,
  getMedioPagoLabel,
  getTipoMovimientoChipProps,
} from './cajaMovimientosUi';

type CajaMovimientosTableProps = {
  rows: CajaMovimientoListItem[];
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (movimiento: CajaMovimientoListItem) => void;
  onAnular: (movimiento: CajaMovimientoListItem) => void;
};

export function CajaMovimientosTable({
  rows,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onAnular,
}: CajaMovimientosTableProps) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Medio de pago</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((movimiento) => (
              <TableRow hover key={movimiento.idMovimiento}>
                <TableCell>{formatMovimientoDate(movimiento.fecha)}</TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" {...getTipoMovimientoChipProps(movimiento.tipo)} />
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatMovimientoCurrency(movimiento.monto)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 260 }} title={movimiento.descripcion ?? ''}>
                    {movimiento.descripcion || 'Sin descripción'}
                  </Typography>
                </TableCell>
                <TableCell>{getMedioPagoLabel(movimiento.medioPago)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    {...getEstadoMovimientoChipProps(movimiento.anulado)}
                  />
                </TableCell>
                <TableCell align="right">
                  <CajaMovimientosActions
                    movimiento={movimiento}
                    onAnular={onAnular}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        labelRowsPerPage="Filas por página"
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
}
