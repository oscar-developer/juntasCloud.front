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
        backdropFilter: 'blur(12px)',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        {!isDesktop && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1.5 }}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            JuntasCloud
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Panel de gestión directiva
          </Typography>
        </Box>

        <Stack alignItems="center" direction="row" spacing={1.5}>
          {user && (
            <Tooltip title={fullName}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: 14,
                  fontWeight: 700,
                  width: 40,
                  height: 40,
                }}
              >
                {getInitials(fullName)}
              </Avatar>
            </Tooltip>
          )}
          <Tooltip title="Cerrar sesión">
            <IconButton color="primary" onClick={logout}>
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
