import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import {
  ASAMBLEA_ATTENDANCE_MOBILE_CARD_HEIGHT,
  ASAMBLEA_ATTENDANCE_MOBILE_LIST_HEIGHT,
  ASAMBLEA_ATTENDANCE_VIRTUAL_OVERSCAN,
} from '../constants';
import type { AttendanceRowVM, AttendanceStatus } from '../types';
import { AsambleaAttendanceActions } from './AsambleaAttendanceActions';
import { getAttendanceChipProps } from './asambleaAttendanceUi';

type AsambleaAttendanceMobileListProps = {
  rows: AttendanceRowVM[];
  disabled?: boolean;
  onSelectStatus: (row: AttendanceRowVM, status: Exclude<AttendanceStatus, 'unknown'>) => void;
};

export function AsambleaAttendanceMobileList({
  rows,
  disabled = false,
  onSelectStatus,
}: AsambleaAttendanceMobileListProps) {
  const listHeight = Math.min(
    ASAMBLEA_ATTENDANCE_MOBILE_LIST_HEIGHT,
    Math.max(ASAMBLEA_ATTENDANCE_MOBILE_CARD_HEIGHT * 3, rows.length * ASAMBLEA_ATTENDANCE_MOBILE_CARD_HEIGHT),
  );
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ASAMBLEA_ATTENDANCE_MOBILE_CARD_HEIGHT,
    overscan: ASAMBLEA_ATTENDANCE_VIRTUAL_OVERSCAN,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <Box
      ref={parentRef}
      sx={{
        height: listHeight,
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
                px: 0.25,
                py: 0.75,
              }}
            >
              <Card elevation={0} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 2.25 }}>
                  <Stack spacing={1.25}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: 18, fontWeight: 800 }} title={row.primaryText}>
                        {row.primaryText}
                      </Typography>
                      <Typography color="text.secondary" noWrap title={row.secondaryText ?? ''} variant="body2">
                        {row.secondaryText ?? 'Sin referencia secundaria'}
                      </Typography>
                    </Box>

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
                      <Chip size="small" {...getAttendanceChipProps(row.status)} />
                    </Stack>

                    <AsambleaAttendanceActions disabled={disabled} onSelectStatus={onSelectStatus} row={row} />
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
