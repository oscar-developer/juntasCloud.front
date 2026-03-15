import { Box, Chip, TableCell, Typography } from '@mui/material';
import type { JuntaDirectiva } from '../types';
import { JuntaDirectivaActions } from './JuntaDirectivaActions';
import { formatJuntaDate, getEstadoChipProps, getPeriodoLabel } from './juntasDirectivasUi';

type JuntasDirectivasTableProps = {
  rows: JuntaDirectiva[];
  onView: (junta: JuntaDirectiva) => void;
  onEdit: (junta: JuntaDirectiva) => void;
  onDelete: (junta: JuntaDirectiva) => void;
};

export function JuntasDirectivasTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: JuntasDirectivasTableProps) {
  const gridTemplateColumns = '2fr 1fr 1.4fr 1fr 180px';

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
          Nombre
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Elección
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Periodo
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1 }}>
          Estado
        </TableCell>
        <TableCell component="div" sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: 'right' }}>
          Acciones
        </TableCell>
      </Box>

      {rows.map((junta) => (
        <Box
          key={junta.idJunta}
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
            <Typography sx={{ fontWeight: 600 }}>{junta.nombre || 'Sin nombre'}</Typography>
            <Typography color="text.secondary" variant="body2">
              {junta.documentoSustento?.trim() || 'Sin documento'}
            </Typography>
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {formatJuntaDate(junta.fechaEleccion)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            {getPeriodoLabel(junta)}
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
            <Chip size="small" variant="outlined" {...getEstadoChipProps(junta.estado)} />
          </TableCell>
          <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
            <JuntaDirectivaActions
              junta={junta}
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
