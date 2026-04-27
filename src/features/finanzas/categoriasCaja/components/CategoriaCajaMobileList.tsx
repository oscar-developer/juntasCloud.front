import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { CajaCategoria } from '../types';
import { CategoriaCajaActions } from './CategoriaCajaActions';
import { getActivoChipProps, getTipoCategoriaCajaChipProps } from './categoriasCajaUi';

const CARD_HEIGHT = 142;
const LIST_HEIGHT = 560;

type CategoriaCajaMobileListProps = {
  rows: CajaCategoria[];
  total: number;
  onView: (categoria: CajaCategoria) => void;
  onEdit: (categoria: CajaCategoria) => void;
  onDelete: (categoria: CajaCategoria) => void;
};

export function CategoriaCajaMobileList({
  rows,
  total,
  onView,
  onEdit,
  onDelete,
}: CategoriaCajaMobileListProps) {
  const listHeight = Math.min(LIST_HEIGHT, Math.max(CARD_HEIGHT * 3, rows.length * CARD_HEIGHT));
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <Box ref={parentRef} sx={{ height: listHeight, overflow: 'auto', position: 'relative' }}>
      <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
        {virtualItems.map((virtualRow) => {
          const categoria = rows[virtualRow.index];
          const displayNumber = Math.max(total - virtualRow.index, 1);

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
                px: 0.25,
                py: 0.75,
              }}
            >
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={1}>
                        <Typography noWrap sx={{ fontSize: 18, fontWeight: 800 }} title={categoria.nombre}>
                          #{displayNumber} {categoria.nombre || 'Categoría sin nombre'}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                          <Chip size="small" variant="outlined" {...getTipoCategoriaCajaChipProps(categoria.tipo)} />
                          <Chip size="small" variant="outlined" {...getActivoChipProps(categoria.activo)} />
                        </Stack>
                      </Stack>
                    </Box>
                    <Box sx={{ flexShrink: 0 }}>
                      <CategoriaCajaActions
                        categoria={categoria}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onView={onView}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
