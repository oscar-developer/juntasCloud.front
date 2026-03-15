import { Box, Chip, CircularProgress, Stack, TableCell, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';
import type { Bien } from '../types';
import { BienActions } from './BienActions';
import { formatBienNumber, getEstadoChipProps } from './bienesUi';

const ROW_HEIGHT = 72;
const TABLE_HEIGHT = 544;
const PREFETCH_THRESHOLD = 8;

type BienTableProps = {
  rows: Bien[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onReachEnd: () => void;
  onView: (bien: Bien) => void;
  onEdit: (bien: Bien) => void;
  onDeactivate: (bien: Bien) => void;
};

export function BienTable({
  rows,
  hasMore = false,
  loadingMore = false,
  onReachEnd,
  onView,
  onEdit,
  onDeactivate,
}: BienTableProps) {
  const containerHeight = Math.min(TABLE_HEIGHT, Math.max(ROW_HEIGHT * 4, rows.length * ROW_HEIGHT));
  const gridTemplateColumns = '2.4fr 1.2fr 0.9fr 1.1fr 1fr 180px';
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: PREFETCH_THRESHOLD,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];

    if (!lastItem) {
      return;
    }

    if (!hasMore || loadingMore || rows.length === 0) {
      return;
    }

    if (lastItem.index >= rows.length - PREFETCH_THRESHOLD) {
      onReachEnd();
    }
  }, [hasMore, loadingMore, onReachEnd, rows.length, virtualItems]);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'grey.50',
          minWidth: 900,
        }}
      >
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Descripción
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Tipo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Cantidad
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Valor estimado
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Estado
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: 'right' }}>
          Acciones
        </TableCell>
      </Box>

      <Box
        ref={parentRef}
        sx={{
          height: containerHeight,
          minWidth: 900,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualRow) => {
            const bien = rows[virtualRow.index];

            if (!bien) {
              return null;
            }

            return (
              <Box
                key={bien.idBien}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns,
                  px: 2,
                  alignItems: 'center',
                  borderBottom: 1,
                  borderColor: 'divider',
                  minWidth: 900,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{bien.descripcion || 'Sin descripcion'}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {bien.ubicacion || 'Sin ubicacion'}
                  </Typography>
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  {bien.tipo || 'No registrado'}
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  {formatBienNumber(bien.cantidad)}
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  {formatBienNumber(bien.valorEstimado)}
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getEstadoChipProps(bien.estado)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                  <BienActions
                    bien={bien}
                    onDeactivate={onDeactivate}
                    onEdit={onEdit}
                    onView={onView}
                  />
                </TableCell>
              </Box>
            );
          })}
        </Box>
      </Box>

      {loadingMore && (
        <Stack alignItems="center" direction="row" justifyContent="center" spacing={1} sx={{ py: 1.25 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="caption">
            Cargando más bienes...
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
