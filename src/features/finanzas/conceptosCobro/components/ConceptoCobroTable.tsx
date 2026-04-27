import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { ConceptoCobro } from '../types';
import { ConceptoCobroActions } from './ConceptoCobroActions';
import {
  getActivoChipProps,
  getRequierePeriodoChipProps,
  getTipoConceptoCobroChipProps,
} from './conceptosCobroUi';

const ROW_HEIGHT = 78;
const TABLE_HEIGHT = 544;

type ConceptoCobroTableProps = {
  rows: ConceptoCobro[];
  onView: (concepto: ConceptoCobro) => void;
  onEdit: (concepto: ConceptoCobro) => void;
  onDelete: (concepto: ConceptoCobro) => void;
};

export function ConceptoCobroTable({ rows, onView, onEdit, onDelete }: ConceptoCobroTableProps) {
  const containerHeight = Math.min(TABLE_HEIGHT, Math.max(ROW_HEIGHT * 4, rows.length * ROW_HEIGHT));
  const gridTemplateColumns = '2.2fr 1.3fr 1fr 1.1fr 180px';
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
          minWidth: 980,
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
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Periodo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: 'right' }}>
          Acciones
        </TableCell>
      </Box>

      <Box ref={parentRef} sx={{ height: containerHeight, minWidth: 980, overflow: 'auto', position: 'relative' }}>
        <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualRow) => {
            const concepto = rows[virtualRow.index];

            if (!concepto) {
              return null;
            }

            return (
              <Box
                key={concepto.idConceptoCobro}
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
                  minWidth: 980,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{concepto.nombre || 'Sin nombre'}</Typography>
                  <Typography color="text.secondary" noWrap variant="body2">
                    {concepto.observaciones || 'Sin observaciones'}
                  </Typography>
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getTipoConceptoCobroChipProps(concepto.tipo)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getActivoChipProps(concepto.activo)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip size="small" variant="outlined" {...getRequierePeriodoChipProps(concepto.requierePeriodo)} />
                </TableCell>
                <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                  <ConceptoCobroActions
                    concepto={concepto}
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
