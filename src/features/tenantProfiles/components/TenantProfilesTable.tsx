import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import type { TenantProfile } from '../types/tenantProfiles.types';
import { getProfileDescription, StatusChip } from './tenantProfileUi';

type TenantProfilesTableProps = {
  rows: TenantProfile[];
  hasMore: boolean;
  loadingMore: boolean;
  onReachEnd: () => void;
  onEdit: (profile: TenantProfile) => void;
  onConfigureModules: (profile: TenantProfile) => void;
  onDelete: (profile: TenantProfile) => void;
};

export function TenantProfilesTable({
  rows,
  hasMore,
  loadingMore,
  onReachEnd,
  onEdit,
  onConfigureModules,
  onDelete,
}: TenantProfilesTableProps) {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

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
      { rootMargin: '160px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, onReachEnd]);

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Total módulos
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Acceso total
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Solo lectura
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Sin acceso
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((profile) => (
            <TableRow hover key={profile.idProfile}>
              <TableCell>
                <Typography sx={{ fontWeight: 700 }}>{profile.nombre}</Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography color="text.secondary" noWrap variant="body2">
                  {getProfileDescription(profile)}
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip activo={profile.activo} />
              </TableCell>
              <TableCell align="right">{profile.totalModules}</TableCell>
              <TableCell align="right">{profile.totalAccess}</TableCell>
              <TableCell align="right">{profile.totalReadOnly}</TableCell>
              <TableCell align="right">{profile.totalNoAccess}</TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <Tooltip title="Editar datos">
                    <IconButton aria-label="Editar datos" onClick={() => onEdit(profile)} size="small">
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Configurar permisos">
                    <IconButton
                      aria-label="Configurar permisos"
                      onClick={() => onConfigureModules(profile)}
                      size="small"
                    >
                      <SecurityRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar perfil">
                    <IconButton
                      aria-label="Eliminar perfil"
                      color="error"
                      onClick={() => onDelete(profile)}
                      size="small"
                    >
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {hasMore && (
            <TableRow ref={sentinelRef}>
              <TableCell colSpan={8}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  {loadingMore && <CircularProgress size={24} />}
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
