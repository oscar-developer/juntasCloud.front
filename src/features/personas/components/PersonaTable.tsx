import { Box, Chip, CircularProgress, Stack, TableCell, Typography } from '@mui/material';
import { type ListChildComponentProps, type ListOnItemsRenderedProps, FixedSizeList } from 'react-window';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

const ROW_HEIGHT = 68;
const TABLE_HEIGHT = 544;
const PREFETCH_THRESHOLD = 8;

type PersonaTableProps = {
  rows: Persona[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onReachEnd: () => void;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onRetire: (persona: Persona) => void;
};

export function PersonaTable({
  rows,
  hasMore = false,
  loadingMore = false,
  onReachEnd,
  onView,
  onEdit,
  onRetire,
}: PersonaTableProps) {
  const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
    if (!hasMore || loadingMore || rows.length === 0) {
      return;
    }

    if (visibleStopIndex >= rows.length - PREFETCH_THRESHOLD) {
      onReachEnd();
    }
  };

  const containerHeight = Math.min(TABLE_HEIGHT, Math.max(ROW_HEIGHT * 4, rows.length * ROW_HEIGHT));
  const gridTemplateColumns = '2.2fr 1fr 1fr 1fr 1fr 180px';

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
          Nombre completo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          DNI
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Teléfono
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

      <FixedSizeList
        height={containerHeight}
        itemCount={rows.length}
        itemSize={ROW_HEIGHT}
        onItemsRendered={handleItemsRendered}
        width="100%"
      >
        {({ index, style }: ListChildComponentProps) => {
          const persona = rows[index];

          return (
            <Box
              key={persona.idPersona}
              style={style}
              sx={{
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
              <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 600, px: 1 }}>
                {getFullName(persona)}
              </TableCell>
              <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                {persona.dni || 'No registrado'}
              </TableCell>
              <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                {persona.telefono || 'No registrado'}
              </TableCell>
              <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
              </TableCell>
              <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
              </TableCell>
              <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                <PersonaActions onEdit={onEdit} onRetire={onRetire} onView={onView} persona={persona} />
              </TableCell>
            </Box>
          );
        }}
      </FixedSizeList>

      {loadingMore && (
        <Stack alignItems="center" direction="row" justifyContent="center" spacing={1} sx={{ py: 1.25 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="caption">
            Cargando más personas...
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
