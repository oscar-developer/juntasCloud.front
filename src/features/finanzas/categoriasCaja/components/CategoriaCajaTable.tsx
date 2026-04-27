import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { CajaCategoria } from '../types';
import { CategoriaCajaActions } from './CategoriaCajaActions';
import { getActivoChipProps, getTipoCategoriaCajaChipProps } from './categoriasCajaUi';

const ROW_HEIGHT = 72;
const TABLE_HEIGHT = 544;

type CategoriaCajaTableProps = {
  rows: CajaCategoria[];
  onView: (categoria: CajaCategoria) => void;
  onEdit: (categoria: CajaCategoria) => void;
  onDelete: (categoria: CajaCategoria) => void;
};

export function CategoriaCajaTable({ rows, onView, onEdit, onDelete }: CategoriaCajaTableProps) {
  const containerHeight = Math.min(TABLE_HEIGHT, Math.max(ROW_HEIGHT * 4, rows.length * ROW_HEIGHT));
  const gridTemplateColumns = '2.2fr 1fr 1fr 180px';
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

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
          minWidth: 760,
        }}
      >
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Nombre
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Tipo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Estado
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: 'right' }}>
          Acciones
        </TableCell>
      </Box>

      <Box ref={parentRef} sx={{ height: containerHeight, minWidth: 760, overflow: 'auto', position: 'relative' }}>
        <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualRow) => {
            const categoria = rows[virtualRow.index];

            if (!categoria) {
              return null;
            }

            return (
              <Box
                key={categoria.idCategoriaCaja}
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
                  minWidth: 760,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{categoria.nombre || 'Sin nombre'}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    ID {categoria.idCategoriaCaja}
                  </Typography>
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getTipoCategoriaCajaChipProps(categoria.tipo)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getActivoChipProps(categoria.activo)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                  <CategoriaCajaActions
                    categoria={categoria}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
                  />
                </TableCell>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
