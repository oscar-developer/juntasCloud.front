import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getDisplayFullName, getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

const CARD_HEIGHT = 132;
const MOBILE_CARD_HEIGHT = 84;
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
  onDelete: (persona: Persona) => void;
};

export function PersonaMobileList({
  rows,
  total,
  hasMore = false,
  loadingMore = false,
  onReachEnd,
  onView,
  onEdit,
  onDelete,
}: PersonaMobileListProps) {
  const theme = useTheme();
  const isMobileOnly = useMediaQuery(theme.breakpoints.down('sm'));
  const rowHeight = isMobileOnly ? MOBILE_CARD_HEIGHT : CARD_HEIGHT;
  const listBottomPadding = isMobileOnly ? 96 : 0;
  const listHeight = Math.min(LIST_HEIGHT, Math.max(rowHeight * (isMobileOnly ? 4 : 3), rows.length * rowHeight));
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
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
    <Stack spacing={{ xs: 1, sm: 2 }}>
      <Box
        ref={parentRef}
        sx={{
          height: listHeight,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: rowVirtualizer.getTotalSize() + listBottomPadding,
            position: 'relative',
            width: '100%',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const persona = rows[virtualRow.index];
            if (!persona) {
              return null;
            }

            const tipoChipProps = getTipoChipProps(persona.tipoParticipante);
            const statusChipProps = getEstadoChipProps(persona.estado);
            const primaryMetaLabel = persona.nroPadron ? `Padrón #${persona.nroPadron}` : tipoChipProps.label;
            const fullName = getFullName(persona);
            const displayName = isMobileOnly ? getDisplayFullName(persona) : fullName;

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
                  px: { xs: 0, sm: 0.25 },
                  py: { xs: 0.5, sm: 0.75 },
                }}
              >
                <Card elevation={0}>
                  <CardContent
                    sx={{
                      px: { xs: 1.5, sm: 2.5 },
                      py: { xs: 1.15, sm: 2.5 },
                      '&:last-child': { pb: { xs: 1.15, sm: 2.5 } },
                    }}
                  >
                    <Stack
                      alignItems={{ xs: 'center', sm: 'center' }}
                      direction="row"
                      justifyContent="space-between"
                      spacing={{ xs: 0.75, sm: 2 }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack spacing={{ xs: 0.55, sm: 1.5 }}>
                          <Typography
                            noWrap={!isMobileOnly}
                            sx={{
                              fontSize: 18,
                              fontWeight: 800,
                              ...(isMobileOnly
                                ? {
                                    display: '-webkit-box',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    letterSpacing: '-0.1px',
                                    lineHeight: 1.25,
                                    overflow: 'hidden',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                  }
                                : {}),
                            }}
                            title={fullName}
                          >
                            {displayName}
                          </Typography>
                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            spacing={{ xs: 0.5, sm: 1 }}
                            useFlexGap
                          >
                            {isMobileOnly ? (
                              <>
                                <Chip
                                  color={persona.nroPadron ? 'primary' : tipoChipProps.color}
                                  label={primaryMetaLabel}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    maxWidth: '100%',
                                    '& .MuiChip-label': { fontSize: 11, fontWeight: 600, px: 0.9 },
                                  }}
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  sx={{
                                    height: 22,
                                    '& .MuiChip-label': { fontSize: 11, fontWeight: 600, px: 0.9 },
                                  }}
                                  variant="outlined"
                                  {...statusChipProps}
                                />
                              </>
                            ) : (
                              <>
                                {persona.nroPadron ? (
                                  <Chip label={`Padrón #${persona.nroPadron}`} size="small" variant="outlined" />
                                ) : null}
                                <Chip size="small" variant="outlined" {...tipoChipProps} />
                                <Chip size="small" variant="outlined" {...statusChipProps} />
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                      <Box sx={{ alignSelf: { xs: 'center', sm: 'center' }, flexShrink: 0 }}>
                        <PersonaActions
                          onDelete={onDelete}
                          onEdit={onEdit}
                          onView={onView}
                          persona={persona}
                          variant={isMobileOnly ? 'menu' : 'icons'}
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
