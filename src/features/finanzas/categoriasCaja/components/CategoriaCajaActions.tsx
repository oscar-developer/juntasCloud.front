import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { CajaCategoria } from '../types';

type CategoriaCajaActionsProps = {
  categoria: CajaCategoria;
  onView: (categoria: CajaCategoria) => void;
  onEdit: (categoria: CajaCategoria) => void;
  onDelete: (categoria: CajaCategoria) => void;
};

export function CategoriaCajaActions({
  categoria,
  onView,
  onEdit,
  onDelete,
}: CategoriaCajaActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(categoria)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(categoria)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Eliminar">
        <span>
          <IconButton color="error" onClick={() => onDelete(categoria)} size="small">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
