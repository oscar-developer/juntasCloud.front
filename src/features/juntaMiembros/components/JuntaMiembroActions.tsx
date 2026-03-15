import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { JuntaMiembro } from '../types';

type JuntaMiembroActionsProps = {
  juntaMiembro: JuntaMiembro;
  onView: (juntaMiembro: JuntaMiembro) => void;
  onEdit: (juntaMiembro: JuntaMiembro) => void;
  onDelete: (juntaMiembro: JuntaMiembro) => void;
};

export function JuntaMiembroActions({
  juntaMiembro,
  onView,
  onEdit,
  onDelete,
}: JuntaMiembroActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(juntaMiembro)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(juntaMiembro)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Eliminar">
        <span>
          <IconButton color="error" onClick={() => onDelete(juntaMiembro)} size="small">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
