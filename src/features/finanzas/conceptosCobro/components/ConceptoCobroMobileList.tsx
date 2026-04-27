import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { ConceptoCobro } from '../types';
import { ConceptoCobroActions } from './ConceptoCobroActions';
import {
  getActivoChipProps,
  getRequierePeriodoChipProps,
  getTipoConceptoCobroChipProps,
} from './conceptosCobroUi';

const CARD_HEIGHT = 166;
const LIST_HEIGHT = 560;

type ConceptoCobroMobileListProps = {
  rows: ConceptoCobro[];
  total: number;
  onView: (concepto: ConceptoCobro) => void;
  onEdit: (concepto: ConceptoCobro) => void;
  onDelete: (concepto: ConceptoCobro) => void;
};

export function ConceptoCobroMobileList({
  rows,
  total,
  onView,
  onEdit,
  onDelete,
}: ConceptoCobroMobileListProps) {
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
          const concepto = rows[virtualRow.index];
          const displayNumber = Math.max(total - virtualRow.index, 1);

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
                px: 0.25,
                py: 0.75,
              }}
            >
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={1}>
                        <Typography noWrap sx={{ fontSize: 18, fontWeight: 800 }} title={concepto.nombre}>
                          #{displayNumber} {concepto.nombre || 'Concepto sin nombre'}
                        </Typography>
                        <Typography color="text.secondary" noWrap variant="body2">
                          {concepto.observaciones || 'Sin observaciones'}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                          <Chip size="small" variant="outlined" {...getTipoConceptoCobroChipProps(concepto.tipo)} />
                          <Chip size="small" variant="outlined" {...getActivoChipProps(concepto.activo)} />
                          <Chip
                            size="small"
                            variant="outlined"
                            {...getRequierePeriodoChipProps(concepto.requierePeriodo)}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                    <Box sx={{ flexShrink: 0 }}>
                      <ConceptoCobroActions
                        concepto={concepto}
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
