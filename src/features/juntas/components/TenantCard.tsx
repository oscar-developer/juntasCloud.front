import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { Tenant } from '../api/types';

type TenantCardProps = {
  tenant: Tenant;
  isOwner: boolean;
  isDeleting?: boolean;
  onEnter: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TenantCard({
  tenant,
  isOwner,
  isDeleting = false,
  onEnter,
  onEdit,
  onDelete,
}: TenantCardProps) {
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Stack spacing={2}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6">{tenant.nombre}</Typography>
              <Stack alignItems="center" direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                {isOwner ? (
                  <AdminPanelSettingsRoundedIcon color="primary" fontSize="small" />
                ) : (
                  <PersonOutlineRoundedIcon color="action" fontSize="small" />
                )}
                <Typography color="text.secondary" variant="body2">
                  {isOwner ? 'Propietario' : 'Invitado'}
                </Typography>
              </Stack>
            </Box>
            <Chip
              color={tenant.estado === 'ACTIVO' ? 'success' : 'default'}
              label={tenant.estado}
              size="small"
            />
          </Stack>

          <Typography color="text.secondary" minHeight={40} variant="body2">
            {tenant.observaciones?.trim() || 'Sin observaciones'}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
          <Button endIcon={<ArrowForwardRoundedIcon />} onClick={onEnter} variant="contained">
            Entrar
          </Button>

          {isOwner && (
            <Stack alignItems="center" direction="row" spacing={0.5}>
              <IconButton aria-label="Editar junta" onClick={onEdit}>
                <EditRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Eliminar junta"
                color="error"
                disabled={isDeleting}
                onClick={onDelete}
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
