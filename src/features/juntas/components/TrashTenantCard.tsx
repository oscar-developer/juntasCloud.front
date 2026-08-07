import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Tenant } from '../types';

type TrashTenantCardProps = {
  tenant: Tenant;
  isDeleting?: boolean;
  onDeletePermanent: () => void;
};

export function TrashTenantCard({
  tenant,
  isDeleting = false,
  onDeletePermanent,
}: TrashTenantCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 3, pb: 2, display: 'flex', flex: 1 }}>
        <Stack spacing={2} sx={{ width: '100%', minWidth: 0 }}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.15 }} variant="h6">
                {tenant.nombre}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                Junta en papelera
              </Typography>
            </Box>
            <Chip
              label={tenant.estado}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha('#64748B', 0.12),
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
            <Typography
              color="text.secondary"
              sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.1 }}
            >
              OBSERVACIONES
            </Typography>
            <Typography color="text.secondary" minHeight={48} sx={{ mt: 1 }} variant="body2">
              {tenant.observaciones?.trim() || 'Sin observaciones registradas.'}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
          <Tooltip title="Falta endpoint de restauración en backend">
            <span>
              <Button
                disabled
                fullWidth
                startIcon={<RestoreFromTrashRoundedIcon />}
                variant="outlined"
              >
                Restaurar
              </Button>
            </span>
          </Tooltip>
          <Button
            color="error"
            disabled={isDeleting}
            fullWidth
            onClick={onDeletePermanent}
            startIcon={<DeleteForeverRoundedIcon />}
            variant="contained"
          >
            Eliminar permanentemente
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
