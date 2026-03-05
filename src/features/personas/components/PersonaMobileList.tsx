import { Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { type ListChildComponentProps, type ListOnItemsRenderedProps, FixedSizeList } from 'react-window';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

const CARD_HEIGHT = 132;
const LIST_HEIGHT = 560;
const PREFETCH_THRESHOLD = 8;

type PersonaMobileListProps = {
  rows: Persona[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onReachEnd: () => void;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onRetire: (persona: Persona) => void;
};

export function PersonaMobileList({
  rows,
  hasMore = false,
  loadingMore = false,
  onReachEnd,
  onView,
  onEdit,
  onRetire,
}: PersonaMobileListProps) {
  const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
    if (!hasMore || loadingMore || rows.length === 0) {
      return;
    }

    if (visibleStopIndex >= rows.length - PREFETCH_THRESHOLD) {
      onReachEnd();
    }
  };

  const listHeight = Math.min(LIST_HEIGHT, Math.max(CARD_HEIGHT * 3, rows.length * CARD_HEIGHT));

  return (
    <Stack spacing={2}>
      <FixedSizeList
        height={listHeight}
        itemCount={rows.length}
        itemSize={CARD_HEIGHT}
        onItemsRendered={handleItemsRendered}
        width="100%"
      >
        {({ index, style }: ListChildComponentProps) => {
          const persona = rows[index];

          return (
            <Box key={persona.idPersona} style={style} sx={{ px: 0.25, py: 0.75 }}>
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={1.5}>
                        <Typography noWrap sx={{ fontSize: 18, fontWeight: 800 }} title={getFullName(persona)}>
                          {getFullName(persona)}
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
        }}
      </FixedSizeList>

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
