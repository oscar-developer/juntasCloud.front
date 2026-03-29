import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import type { Persona } from '../../personas/types';
import type { FaenaParticipacion } from '../types';
import { FaenaParticipacionActions } from './FaenaParticipacionActions';
import {
  formatFaenaParticipacionTime,
  getAnuladoChipProps,
  getFaenaParticipacionEstadoChipProps,
  getFaenaParticipacionMultaLabel,
  getPersonaLabelById,
} from './faenaParticipacionUi';

type FaenaParticipacionTableProps = {
  rows: FaenaParticipacion[];
  personas: Persona[] | Record<string, Persona>;
  onView: (participacion: FaenaParticipacion) => void;
  onEdit: (participacion: FaenaParticipacion) => void;
  onAnnul: (participacion: FaenaParticipacion) => void;
};

export function FaenaParticipacionTable({ rows, personas, onView, onEdit, onAnnul }: FaenaParticipacionTableProps) {
  const gridTemplateColumns = '2.2fr 1fr 1fr 1fr 1.3fr 1fr 160px';

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'grey.50',
          minWidth: 1050,
        }}
      >
        {['Persona', 'Estado', 'Hora llegada', 'Personas extra', 'Multa', 'Anulado', 'Acciones'].map((label) => (
          <TableCell
            key={label}
            component="div"
            sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: label === 'Acciones' ? 'right' : 'left' }}
          >
            {label}
          </TableCell>
        ))}
      </Box>

      {rows.map((participacion) => (
        <Box
          key={participacion.idFaenaParticipacion}
          sx={{
            display: 'grid',
            gridTemplateColumns,
            px: 2,
            py: 1.5,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            minWidth: 1050,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{getPersonaLabelById(personas, participacion.idPersona)}</Typography>
            <Typography color="text.secondary" variant="body2">
              {participacion.observaciones?.trim() || 'Sin observaciones'}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getFaenaParticipacionEstadoChipProps(participacion.estado)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {formatFaenaParticipacionTime(participacion.horaLlegada)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {participacion.cantPersonasExtra}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getFaenaParticipacionMultaLabel(participacion)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getAnuladoChipProps(participacion.anulado)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
            <Stack alignItems="flex-end">
              <FaenaParticipacionActions
                onAnnul={onAnnul}
                onEdit={onEdit}
                onView={onView}
                participacion={participacion}
              />
            </Stack>
          </TableCell>
        </Box>
      ))}
    </Box>
  );
}
