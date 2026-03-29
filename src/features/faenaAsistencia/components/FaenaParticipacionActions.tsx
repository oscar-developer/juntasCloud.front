import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { FaenaParticipacion } from '../types';

type FaenaParticipacionActionsProps = {
  participacion: FaenaParticipacion;
  onView: (participacion: FaenaParticipacion) => void;
  onEdit: (participacion: FaenaParticipacion) => void;
  onAnnul: (participacion: FaenaParticipacion) => void;
};

export function FaenaParticipacionActions({
  participacion,
  onView,
  onEdit,
  onAnnul,
}: FaenaParticipacionActionsProps) {
  const isAnnulled = participacion.anulado;

  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(participacion)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton disabled={isAnnulled} onClick={() => onEdit(participacion)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Anular">
        <span>
          <IconButton color="error" disabled={isAnnulled} onClick={() => onAnnul(participacion)} size="small">
            <BlockRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
