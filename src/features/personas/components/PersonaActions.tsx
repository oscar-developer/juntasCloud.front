import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import { IconButton, Stack, Tooltip } from '@mui/material';
import type { Persona } from '../types';

type PersonaActionsProps = {
  persona: Persona;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onRetire: (persona: Persona) => void;
};

export function PersonaActions({
  persona,
  onView,
  onEdit,
  onRetire,
}: PersonaActionsProps) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <span>
          <IconButton onClick={() => onView(persona)} size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Editar">
        <span>
          <IconButton onClick={() => onEdit(persona)} size="small">
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Retirar">
        <span>
          <IconButton
            color="error"
            disabled={persona.estado === 'RETIRADO'}
            onClick={() => onRetire(persona)}
            size="small"
          >
            <PersonOffRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
