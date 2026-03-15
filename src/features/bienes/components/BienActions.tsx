import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { Bien } from '../types';

type BienActionsProps = {
  bien: Bien;
  onView: (bien: Bien) => void;
  onEdit: (bien: Bien) => void;
  onDeactivate: (bien: Bien) => void;
};

export function BienActions({
  bien,
  onView,
  onEdit,
  onDeactivate,
}: BienActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(bien)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(bien)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Dar de baja">
        <span>
          <IconButton
            color="error"
            disabled={bien.estado === 'DADO_DE_BAJA'}
            onClick={() => onDeactivate(bien)}
            size="small"
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
