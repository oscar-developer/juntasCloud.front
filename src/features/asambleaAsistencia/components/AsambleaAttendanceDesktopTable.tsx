import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import {
  ASAMBLEA_ATTENDANCE_DESKTOP_ROW_HEIGHT,
  ASAMBLEA_ATTENDANCE_DESKTOP_TABLE_HEIGHT,
  ASAMBLEA_ATTENDANCE_VIRTUAL_OVERSCAN,
} from '../constants';
import type { AttendanceRowVM, AttendanceStatus } from '../types';
import { AsambleaAttendanceActions } from './AsambleaAttendanceActions';
import { formatAttendanceStatusLabel, getAttendanceChipProps } from './asambleaAttendanceUi';

type AsambleaAttendanceDesktopTableProps = {
  rows: AttendanceRowVM[];
  disabled?: boolean;
  onSelectStatus: (row: AttendanceRowVM, status: Exclude<AttendanceStatus, 'unknown'>) => void;
  onRequestLate: (row: AttendanceRowVM) => void;
};

export function AsambleaAttendanceDesktopTable({
  rows,
  disabled = false,
  onSelectStatus,
  onRequestLate,
}: AsambleaAttendanceDesktopTableProps) {
  const containerHeight = Math.min(
    ASAMBLEA_ATTENDANCE_DESKTOP_TABLE_HEIGHT,
    Math.max(ASAMBLEA_ATTENDANCE_DESKTOP_ROW_HEIGHT * 4, rows.length * ASAMBLEA_ATTENDANCE_DESKTOP_ROW_HEIGHT),
  );
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ASAMBLEA_ATTENDANCE_DESKTOP_ROW_HEIGHT,
    overscan: ASAMBLEA_ATTENDANCE_VIRTUAL_OVERSCAN,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const gridTemplateColumns = '2.25fr 1.2fr 0.9fr 330px';

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
          minWidth: 1070,
        }}
      >
        {['Asistente', 'Condición', 'Estado', 'Registro'].map((label) => (
          <TableCell
            component="div"
            key={label}
            sx={{ borderBottom: 0, fontWeight: 700, px: 1, textAlign: label === 'Registro' ? 'right' : 'left' }}
          >
            {label}
          </TableCell>
        ))}
      </Box>

      <Box
        ref={parentRef}
        sx={{
          height: containerHeight,
          minWidth: 1070,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];

            if (!row) {
              return null;
            }

            return (
              <Box
                key={row.id}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns,
                  px: 2,
                  alignItems: 'center',
                  borderBottom: 1,
                  borderColor: 'divider',
                  minWidth: 1070,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 700 }} title={row.primaryText}>
                    {row.primaryText}
                  </Typography>
                  <Typography color="text.secondary" noWrap title={row.secondaryText ?? ''} variant="body2">
                    {row.secondaryText ?? 'Sin referencia secundaria'}
                  </Typography>
                </TableCell>

                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                    <Chip
                      color={row.isPadronado ? 'primary' : 'default'}
                      label={row.isPadronado ? 'PADRONADO' : 'NO PADRONADO'}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      color={row.canVote ? 'success' : 'default'}
                      label={row.canVote ? 'CON VOTO' : 'SIN VOTO'}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </TableCell>

                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip
                    size="small"
                    {...getAttendanceChipProps(row.status)}
                    label={formatAttendanceStatusLabel(row.status, row.horaLlegada)}
                  />
                </TableCell>

                <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                  <Stack alignItems="flex-end">
                    <AsambleaAttendanceActions
                      disabled={disabled}
                      onRequestLate={onRequestLate}
                      onSelectStatus={onSelectStatus}
                      row={row}
                    />
                  </Stack>
                </TableCell>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
