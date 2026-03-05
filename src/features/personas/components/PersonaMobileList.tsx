import { Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

const CARD_HEIGHT = 132;
const LIST_HEIGHT = 560;
const PREFETCH_THRESHOLD = 8;

type PersonaMobileListProps = {
  rows: Persona[];
  total: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onReachEnd: () => void;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onRetire: (persona: Persona) => void;
};

export function PersonaMobileList({
  rows,
  total,
  hasMore = false,
  loadingMore = false,
  onReachEnd,
  onView,
  onEdit,
  onRetire,
}: PersonaMobileListProps) {
  const listHeight = Math.min(LIST_HEIGHT, Math.max(CARD_HEIGHT * 3, rows.length * CARD_HEIGHT));
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
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
    <Stack spacing={2}>
      <Box
        ref={parentRef}
        sx={{
          height: listHeight,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualRow) => {
            const persona = rows[virtualRow.index];
            const displayNumber = Math.max(total - virtualRow.index, 1);

            if (!persona) {
              return null;
            }

            return (
              <Box
                key={persona.idPersona}
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
                        <Stack spacing={1.5}>
                          <Typography noWrap sx={{ fontSize: 18, fontWeight: 800 }} title={getFullName(persona)}>
                            #{displayNumber} {getFullName(persona)}
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                            <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
                            <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
                          </Stack>
                        </Stack>
                      </Box>
                      <Box sx={{ flexShrink: 0 }}>
                        <PersonaActions onEdit={onEdit} onRetire={onRetire} onView={onView} persona={persona} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>

      {loadingMore && (
        <Stack alignItems="center" direction="row" justifyContent="center" spacing={1} sx={{ py: 0.5 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="caption">
            Cargando más personas...
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
