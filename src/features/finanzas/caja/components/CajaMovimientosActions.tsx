import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { CajaMovimientoListItem } from '../types';

type CajaMovimientosActionsProps = {
  movimiento: CajaMovimientoListItem;
  onEdit: (movimiento: CajaMovimientoListItem) => void;
  onAnular: (movimiento: CajaMovimientoListItem) => void;
};

export function CajaMovimientosActions({
  movimiento,
  onEdit,
  onAnular,
}: CajaMovimientosActionsProps) {
  const disabled = movimiento.anulado;

  return (
    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
      <Tooltip title={disabled ? 'No se puede editar un movimiento anulado' : 'Editar'}>
        <span>
          <IconButton
            color="primary"
            disabled={disabled}
            onClick={() => onEdit(movimiento)}
            size="small"
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={disabled ? 'Movimiento anulado' : 'Anular'}>
        <span>
          <IconButton
            color="error"
            disabled={disabled}
            onClick={() => onAnular(movimiento)}
            size="small"
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
