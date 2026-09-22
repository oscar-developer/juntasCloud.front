import { Box, Chip, Stack, TableCell, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { getTipoChipProps } from '../../personas/components/personaUi';
import {
  FAENA_ATTENDANCE_DESKTOP_ROW_HEIGHT,
  FAENA_ATTENDANCE_DESKTOP_TABLE_HEIGHT,
  FAENA_ATTENDANCE_VIRTUAL_OVERSCAN,
} from '../constants';
import type { FaenaAttendanceRowVM, FaenaAttendanceStatus } from '../types';
import { FaenaAttendanceActions } from './FaenaAttendanceActions';
import {
  formatFaenaAttendanceStatusLabel,
  getFaenaAttendanceChipProps,
} from './faenaAttendanceUi';

type FaenaAttendanceDesktopTableProps = {
  rows: FaenaAttendanceRowVM[];
  disabled?: boolean;
  onSelectStatus: (
    row: FaenaAttendanceRowVM,
    status: Exclude<FaenaAttendanceStatus, 'unknown'>,
  ) => void;
  onRequestLate: (row: FaenaAttendanceRowVM) => void;
};

export function FaenaAttendanceDesktopTable({
  rows,
  disabled = false,
  onSelectStatus,
  onRequestLate,
}: FaenaAttendanceDesktopTableProps) {
  const containerHeight = Math.min(
    FAENA_ATTENDANCE_DESKTOP_TABLE_HEIGHT,
    Math.max(FAENA_ATTENDANCE_DESKTOP_ROW_HEIGHT * 4, rows.length * FAENA_ATTENDANCE_DESKTOP_ROW_HEIGHT),
  );
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => FAENA_ATTENDANCE_DESKTOP_ROW_HEIGHT,
    overscan: FAENA_ATTENDANCE_VIRTUAL_OVERSCAN,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const gridTemplateColumns = '2.2fr 1fr 0.9fr 330px';

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
          minWidth: 1030,
        }}
      >
        {['Persona', 'Tipo', 'Estado', 'Registro'].map((label) => (
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
          minWidth: 1030,
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
                  minWidth: 1030,
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
                    <Chip size="small" variant="outlined" {...getTipoChipProps(row.participantType)} />
                  </Stack>
                </TableCell>

                <TableCell component="div" sx={{ borderBottom: 0, px: 1 }}>
                  <Chip
                    size="small"
                    {...getFaenaAttendanceChipProps(row.status)}
                    label={formatFaenaAttendanceStatusLabel(row.status, row.horaLlegada)}
                  />
                </TableCell>

                <TableCell component="div" sx={{ borderBottom: 0, px: 1, textAlign: 'right' }}>
                  <Stack alignItems="flex-end">
                    <FaenaAttendanceActions
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
