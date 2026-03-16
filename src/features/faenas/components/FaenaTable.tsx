import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import type { Faena } from '../types';
import { FaenaActions } from './FaenaActions';
import {
  formatFaenaDate,
  getFaenaEstadoChipProps,
  getFaenaMultaLabel,
  getFaenaScheduleLabel,
  getFaenaTipoChipProps,
} from './faenasUi';

type FaenaTableProps = {
  rows: Faena[];
  onView: (faena: Faena) => void;
  onEdit: (faena: Faena) => void;
  onDelete: (faena: Faena) => void;
};

export function FaenaTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: FaenaTableProps) {
  const gridTemplateColumns = '2.3fr 1.2fr 1fr 1fr 1fr 1fr 1fr 160px';

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
          minWidth: 1080,
        }}
      >
        {['Descripción', 'Lugar', 'Fecha', 'Horario', 'Tipo', 'Estado', 'Multa base', 'Acciones'].map((label) => (
          <TableCell
            key={label}
            component="div"
            sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: label === 'Acciones' ? 'right' : 'left' }}
          >
            {label}
          </TableCell>
        ))}
      </Box>

      {rows.map((faena) => (
        <Box
          key={faena.idFaena}
          sx={{
            display: 'grid',
            gridTemplateColumns,
            px: 2,
            py: 1.5,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            minWidth: 1080,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{faena.descripcion || 'Faena sin descripción'}</Typography>
            <Typography color="text.secondary" variant="body2">
              {faena.observaciones?.trim() || 'Sin observaciones'}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {faena.lugar?.trim() || 'No registrado'}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {formatFaenaDate(faena.fechaProgramada)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getFaenaScheduleLabel(faena)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getFaenaTipoChipProps(faena.tipoFaena)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getFaenaEstadoChipProps(faena.estado)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getFaenaMultaLabel(faena.montoMultaBase)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
            <Stack alignItems="flex-end">
              <FaenaActions faena={faena} onDelete={onDelete} onEdit={onEdit} onView={onView} />
            </Stack>
          </TableCell>
        </Box>
      ))}
    </Box>
  );
}
