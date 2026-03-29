import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Faena } from '../types';

type FaenaActionsProps = {
  faena: Faena;
  onView: (faena: Faena) => void;
  onEdit: (faena: Faena) => void;
  onDelete: (faena: Faena) => void;
  attendanceTo?: string;
};

export function FaenaActions({
  faena,
  onView,
  onEdit,
  onDelete,
  attendanceTo,
}: FaenaActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      {attendanceTo ? (
        <Tooltip title="Registrar asistencia">
          <span>
            <IconButton component={RouterLink} size="small" to={attendanceTo}>
              <HowToRegRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
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