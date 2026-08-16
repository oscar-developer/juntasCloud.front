import { Box, Card, CardContent, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import {
  ASAMBLEA_ATTENDANCE_COMPACT_MOBILE_CARD_HEIGHT,
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
  const theme = useTheme();
  const isMobileOnly = useMediaQuery(theme.breakpoints.down('sm'));
  const rowHeight = isMobileOnly
    ? ASAMBLEA_ATTENDANCE_COMPACT_MOBILE_CARD_HEIGHT
    : ASAMBLEA_ATTENDANCE_MOBILE_CARD_HEIGHT;
  const listHeight = Math.min(
    ASAMBLEA_ATTENDANCE_MOBILE_LIST_HEIGHT,
    Math.max(rowHeight * (isMobileOnly ? 4 : 3), rows.length * rowHeight),
  );
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
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
                px: { xs: 0, sm: 0.25 },
                py: { xs: 0.5, sm: 0.75 },
              }}
            >
              <Card elevation={0} sx={{ borderRadius: 3 }}>
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2.25 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2.25 } },
                  }}
                >
                  <Stack spacing={{ xs: 1, sm: 1.25 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap={!isMobileOnly}
                        sx={{
                          fontSize: { xs: 15, sm: 18 },
                          fontWeight: { xs: 700, sm: 800 },
                          lineHeight: { xs: 1.25, sm: 1.35 },
                          ...(isMobileOnly
                            ? {
                                display: '-webkit-box',
                                letterSpacing: '-0.1px',
                                overflow: 'hidden',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                              }
                            : {}),
                        }}
                        title={row.primaryText}
                      >
                        {isMobileOnly ? row.displayPrimaryText : row.primaryText}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        noWrap
                        sx={{ fontSize: { xs: 12.5, sm: 14 }, mt: { xs: 0.35, sm: 0 } }}
                        title={isMobileOnly ? row.compactSecondaryText : row.secondaryText ?? ''}
                        variant="body2"
                      >
                        {isMobileOnly
                          ? row.compactSecondaryText
                          : row.secondaryText ?? 'Sin referencia secundaria'}
                      </Typography>
                    </Box>

                    <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                      {isMobileOnly ? (
                        <Chip
                          size="small"
                          sx={{ height: 22, '& .MuiChip-label': { fontSize: 11, fontWeight: 600, px: 0.9 } }}
                          {...getAttendanceChipProps(row.status)}
                        />
                      ) : (
                        <>
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
                        </>
                      )}
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
