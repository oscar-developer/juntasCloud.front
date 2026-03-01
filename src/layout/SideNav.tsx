import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface SideNavProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Juntas', path: '/juntas', icon: <MeetingRoomRoundedIcon /> },
  { label: 'Personas', path: '/personas', icon: <Groups2RoundedIcon /> },
  { label: 'Terrenos', path: '/terrenos', icon: <HomeWorkRoundedIcon /> },
  { label: 'Configuración', path: '/configuracion', icon: <SettingsRoundedIcon /> },
];

export function SideNav({ drawerWidth, mobileOpen, onClose }: SideNavProps) {
  const { logout } = useAuth();
  const location = useLocation();

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.6 }}>
          Plataforma
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 800 }}>JuntasCloud</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
          Gestión sobria y clara para la junta directiva.
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;

          return (
            <ListItemButton
              component={NavLink}
              end={item.path === '/'}
              key={item.path}
              onClick={onClose}
              selected={selected}
              to={item.path}
              sx={{
                borderRadius: 2.5,
                color: 'text.primary',
                mb: 0.75,
                '&.active, &.Mui-selected': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Stack sx={{ p: 2 }}>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 2.5,
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Stack>
    </Box>
  );

  return (
    <>
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={onClose}
        open={mobileOpen}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
        variant="temporary"
      >
        {drawerContent}
      </Drawer>

      <Drawer
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
        variant="permanent"
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
