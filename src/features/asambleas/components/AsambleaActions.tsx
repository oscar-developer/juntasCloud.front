import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { Asamblea } from '../types';

type AsambleaActionsProps = {
  asamblea: Asamblea;
  onView: (asamblea: Asamblea) => void;
  onEdit: (asamblea: Asamblea) => void;
  onDelete: (asamblea: Asamblea) => void;
};

export function AsambleaActions({
  asamblea,
  onView,
  onEdit,
  onDelete,
}: AsambleaActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(asamblea)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(asamblea)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Eliminar">
        <span>
          <IconButton color="error" onClick={() => onDelete(asamblea)} size="small">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
