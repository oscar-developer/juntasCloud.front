import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import type { Asamblea } from '../types';
import { AsambleaActions } from './AsambleaActions';
import {
  formatAsambleaDate,
  getAsambleaConvocatoriaChipProps,
  getAsambleaEstadoChipProps,
  getAsambleaQuorumLabel,
  getAsambleaRealScheduleLabel,
  getAsambleaTipoChipProps,
} from './asambleasUi';

type AsambleasTableProps = {
  rows: Asamblea[];
  onView: (asamblea: Asamblea) => void;
  onEdit: (asamblea: Asamblea) => void;
  onDelete: (asamblea: Asamblea) => void;
};

export function AsambleasTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: AsambleasTableProps) {
  const gridTemplateColumns = '2.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr 1.1fr 160px';

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
          minWidth: 1180,
        }}
      >
        {['Tema principal', 'Lugar', 'Fecha programada', 'Hora real', 'Tipo', 'Convocatoria', 'Estado', 'Quórum', 'Acciones'].map((label) => (
          <TableCell
            key={label}
            component="div"
            sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: label === 'Acciones' ? 'right' : 'left' }}
          >
            {label}
          </TableCell>
        ))}
      </Box>

      {rows.map((asamblea) => (
        <Box
          key={asamblea.idAsamblea}
          sx={{
            display: 'grid',
            gridTemplateColumns,
            px: 2,
            py: 1.5,
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            minWidth: 1180,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{asamblea.temaPrincipal || 'Asamblea sin tema'}</Typography>
            <Typography color="text.secondary" variant="body2">
              {asamblea.numeroActa?.trim() || 'Sin acta'}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {asamblea.lugar?.trim() || 'No registrado'}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {formatAsambleaDate(asamblea.fechaProgramada)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getAsambleaRealScheduleLabel(asamblea)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getAsambleaTipoChipProps(asamblea.tipo)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getAsambleaConvocatoriaChipProps(asamblea.convocatoria)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getAsambleaEstadoChipProps(asamblea.estado)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getAsambleaQuorumLabel(asamblea)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
            <Stack alignItems="flex-end">
              <AsambleaActions asamblea={asamblea} onDelete={onDelete} onEdit={onEdit} onView={onView} />
            </Stack>
          </TableCell>
        </Box>
      ))}
    </Box>
  );
}
