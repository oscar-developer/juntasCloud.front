import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { IconButton, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import type { Persona } from '../types';

type PersonaActionsProps = {
  persona: Persona;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
  variant?: 'icons' | 'menu';
};

export function PersonaActions({
  persona,
  onView,
  onEdit,
  onDelete,
  variant = 'icons',
}: PersonaActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const runAction = (action: (persona: Persona) => void) => {
    closeMenu();
    action(persona);
  };

  if (variant === 'menu') {
    return (
      <>
        <Tooltip title="Acciones">
          <IconButton
            aria-controls={menuOpen ? `persona-actions-${persona.idPersona}` : undefined}
            aria-haspopup="menu"
            aria-label="Acciones"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={openMenu}
            size="small"
            sx={{
              color: 'text.secondary',
              height: 40,
              ml: 0.5,
              width: 40,
            }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id={`persona-actions-${persona.idPersona}`}
          onClose={closeMenu}
          open={menuOpen}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => runAction(onView)}>Ver ficha</MenuItem>
          <MenuItem onClick={() => runAction(onEdit)}>Editar</MenuItem>
          <MenuItem onClick={() => runAction(onDelete)} sx={{ color: 'error.main' }}>
            Eliminar
          </MenuItem>
        </Menu>
      </>
    );
  }

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
      <Tooltip title="Eliminar">
        <span>
          <IconButton
            color="error"
            onClick={() => onDelete(persona)}
            size="small"
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
