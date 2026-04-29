import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import type { TenantProfile } from '../types/tenantProfiles.types';
import { getProfileDescription, StatusChip } from './tenantProfileUi';

type TenantProfileMobileCardProps = {
  rows: TenantProfile[];
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onReachEnd: () => void;
  onEdit: (profile: TenantProfile) => void;
  onConfigureModules: (profile: TenantProfile) => void;
  onDelete: (profile: TenantProfile) => void;
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
  );
}

export function TenantProfileMobileCard({
  rows,
  total,
  hasMore,
  loadingMore,
  onReachEnd,
  onEdit,
  onConfigureModules,
  onDelete,
}: TenantProfileMobileCardProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onReachEnd();
        }
      },
      { rootMargin: '180px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, onReachEnd]);

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        {rows.length} de {total} perfiles
      </Typography>

      {rows.map((profile) => (
        <Card elevation={0} key={profile.idProfile}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                    {profile.nombre}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                    {getProfileDescription(profile)}
                  </Typography>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  <StatusChip activo={profile.activo} />
                </Box>
              </Stack>

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={2}
                sx={{
                  '& > *': {
                    minWidth: 'calc(50% - 8px)',
                  },
                }}
              >
                <Metric label="Módulos" value={profile.totalModules} />
                <Metric label="Acceso total" value={profile.totalAccess} />
                <Metric label="Solo lectura" value={profile.totalReadOnly} />
                <Metric label="Sin acceso" value={profile.totalNoAccess} />
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Button onClick={() => onEdit(profile)} size="small" startIcon={<EditRoundedIcon />}>
                  Editar
                </Button>
                <Button
                  onClick={() => onConfigureModules(profile)}
                  size="small"
                  startIcon={<SecurityRoundedIcon />}
                >
                  Permisos
                </Button>
                <Button
                  color="error"
                  onClick={() => onDelete(profile)}
                  size="small"
                  startIcon={<DeleteRoundedIcon />}
                >
                  Eliminar
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          {loadingMore && <CircularProgress size={24} />}
        </Box>
      )}
    </Stack>
  );
}
