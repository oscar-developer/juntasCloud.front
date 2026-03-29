import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { FaenaAttendanceRowVM, FaenaAttendanceStatus } from '../types';

type FaenaAttendanceActionsProps = {
  row: FaenaAttendanceRowVM;
  disabled?: boolean;
  onSelectStatus: (
    row: FaenaAttendanceRowVM,
    status: Exclude<FaenaAttendanceStatus, 'unknown'>,
  ) => void;
};

export function FaenaAttendanceActions({
  row,
  disabled = false,
  onSelectStatus,
}: FaenaAttendanceActionsProps) {
  const actionsDisabled = disabled || row.isSaving;

  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} useFlexGap>
        <Button
          color="success"
          disabled={actionsDisabled}
          onClick={() => onSelectStatus(row, 'present')}
          size="small"
          sx={{ minWidth: 94 }}
          variant={row.status === 'present' ? 'contained' : 'outlined'}
        >
          Presente
        </Button>
        <Button
          color="error"
          disabled={actionsDisabled}
          onClick={() => onSelectStatus(row, 'absent')}
          size="small"
          sx={{ minWidth: 94 }}
          variant={row.status === 'absent' ? 'contained' : 'outlined'}
        >
          Ausente
        </Button>
      </Stack>

      <Box sx={{ minHeight: 22 }}>
        {row.saveState === 'saving' ? (
          <Stack alignItems="center" direction="row" spacing={0.75}>
            <CircularProgress size={12} />
            <Typography color="text.secondary" variant="caption">
              Guardando...
            </Typography>
          </Stack>
        ) : null}

        {row.saveState === 'saved' ? (
          <Stack alignItems="center" direction="row" spacing={0.75}>
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 16 }} />
            <Typography color="success.main" variant="caption">
              Guardado
            </Typography>
          </Stack>
        ) : null}

        {row.saveState === 'error' ? (
          <Stack alignItems="center" direction="row" spacing={0.75} useFlexGap>
            <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 16 }} />
            <Typography
              color="error.main"
              sx={{ flex: 1, minWidth: 0 }}
              title={row.errorMessage ?? 'No se pudo guardar el cambio.'}
              variant="caption"
            >
              {row.errorMessage ?? 'No se pudo guardar.'}
            </Typography>
            {row.retryStatus ? (
              <Button
                color="error"
                disabled={disabled}
                onClick={() => onSelectStatus(row, row.retryStatus!)}
                size="small"
                sx={{ minWidth: 0, px: 0.5 }}
              >
                Reintentar
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
}
