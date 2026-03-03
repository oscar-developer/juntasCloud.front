import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useAuth } from '../auth/useAuth';

interface TopBarProps {
  drawerWidth: number;
  onMenuClick: () => void;
  isDesktop: boolean;
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function TopBar({ drawerWidth, onMenuClick, isDesktop }: TopBarProps) {
  const { user, logout } = useAuth();
  const fullName = [user?.nombres, user?.apellidos].filter(Boolean).join(' ').trim();

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(18px)',
        bgcolor: alpha('#FFFFFF', 0.9),
      }}
    >
      <Toolbar sx={{ minHeight: 80, px: { xs: 1, sm: 1.5, md: 0 } }}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
          sx={{ width: '100%', minWidth: 0, maxWidth: 1440, mx: 'auto' }}
        >
          {!isDesktop && (
            <IconButton edge="start" onClick={onMenuClick}>
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 800, lineHeight: 1.05 }}>
              
              <Box component="span" sx={{ fontWeight: 700 }}>
                  Juntas
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 400,
                    color: 'text.secondary',
                  }}
                >
                  Cloud
                </Box>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 13.5 }} variant="body2">
              Dashboard global y accesos
            </Typography>
          </Box>

          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{
              px: { xs: 0.5, md: 1 },
              py: 0.5,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha('#FFFFFF', 0.78),
            }}
          >
            {user && (
              <Tooltip title={fullName}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: 14,
                    fontWeight: 700,
                    width: 42,
                    height: 42,
                  }}
                >
                  {getInitials(fullName)}
                </Avatar>
              </Tooltip>
            )}
            <Tooltip title="Cerrar sesión">
              <IconButton
                color="primary"
                onClick={logout}
                sx={{
                  border: '1px solid',
                  borderColor: alpha('#EB7A3C', 0.18),
                  bgcolor: alpha('#EB7A3C', 0.06),
                }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
