import { Box, Chip, TableCell, Typography } from '@mui/material';
import type { JuntaMiembro } from '../types';
import { JuntaMiembroActions } from './JuntaMiembroActions';
import {
  getCargoChipProps,
  getJuntaMiembroPeriodoLabel,
} from './juntaMiembrosUi';

type JuntaMiembrosTableProps = {
  rows: JuntaMiembro[];
  getPersonaLabel: (idPersona: string | number) => string;
  onView: (juntaMiembro: JuntaMiembro) => void;
  onEdit: (juntaMiembro: JuntaMiembro) => void;
  onDelete: (juntaMiembro: JuntaMiembro) => void;
};

export function JuntaMiembrosTable({
  rows,
  getPersonaLabel,
  onView,
  onEdit,
  onDelete,
}: JuntaMiembrosTableProps) {
  const gridTemplateColumns = '2fr 1.2fr 1.5fr 2fr 180px';

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
          minWidth: 860,
        }}
      >
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Persona
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Cargo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Periodo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Observaciones
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: 'right' }}>
          Acciones
        </TableCell>
      </Box>

      {rows.map((juntaMiembro) => (
        <Box
          key={juntaMiembro.idJuntaMiembro}
          sx={{
            display: 'grid',
            gridTemplateColumns,
            px: 2,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            minWidth: 860,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{getPersonaLabel(juntaMiembro.idPersona)}</Typography>
            <Typography color="text.secondary" variant="body2">
              ID persona #{juntaMiembro.idPersona}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getCargoChipProps(juntaMiembro.cargo)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getJuntaMiembroPeriodoLabel(juntaMiembro)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Typography color="text.secondary" variant="body2">
              {juntaMiembro.observaciones?.trim() || 'Sin observaciones'}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
            <JuntaMiembroActions
              juntaMiembro={juntaMiembro}
              onDelete={onDelete}
              onEdit={onEdit}
              onView={onView}
            />
          </TableCell>
        </Box>
      ))}
    </Box>
  );
}
