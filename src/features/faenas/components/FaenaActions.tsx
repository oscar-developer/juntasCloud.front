import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { Faena } from '../types';

type FaenaActionsProps = {
  faena: Faena;
  onView: (faena: Faena) => void;
  onEdit: (faena: Faena) => void;
  onDelete: (faena: Faena) => void;
};

export function FaenaActions({
  faena,
  onView,
  onEdit,
  onDelete,
}: FaenaActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(faena)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(faena)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Eliminar">
        <span>
          <IconButton color="error" onClick={() => onDelete(faena)} size="small">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
