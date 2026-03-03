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
import { alpha } from '@mui/material/styles';
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
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { md: 280 },
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha('#EB7A3C', 0.22),
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3.25, pb: 2.25, display: 'flex', flex: 1, minWidth: 0 }}>
        <Stack spacing={2.25} sx={{ width: '100%', minWidth: 0 }}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1.25}
            sx={{ minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }} variant="h6">
                {tenant.nombre}
              </Typography>
              <Stack alignItems="center" direction="row" spacing={0.75} sx={{ mt: 1 }}>
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
              sx={{
                fontWeight: 700,
                bgcolor:
                  tenant.estado === 'ACTIVO' ? alpha('#22C55E', 0.12) : alpha('#64748B', 0.12),
                color: 'text.primary',
              }}
            />
          </Stack>

          <Box
            sx={{
              flex: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha('#F8FAFC', 0.9),
              px: 2,
              py: 1,
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.1 }}>
              OBSERVACIONES
            </Typography>
            <Typography color="text.secondary" minHeight={52} sx={{ mt: 1 }} variant="body2">
              {tenant.observaciones?.trim() || 'Sin observaciones por el momento.'}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3.25, pb: 3.25, pt: 0 }}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{ width: '100%', flexWrap: 'wrap', gap: 1.25 }}
        >
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={onEnter}
            sx={{ minWidth: 118 }}
            variant="contained"
          >
            Entrar
          </Button>

          {isOwner && (
            <Stack
              alignItems="center"
              direction="row"
              spacing={0.5}
              sx={{
                px: 0.5,
                py: 0.25,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha('#FFFFFF', 0.92),
              }}
            >
              <IconButton
                aria-label="Editar junta"
                onClick={onEdit}
                sx={{ color: 'text.secondary' }}
              >
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
