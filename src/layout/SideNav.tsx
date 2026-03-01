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
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        color: '#f8fafc',
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="overline" sx={{ color: 'rgba(248, 250, 252, 0.72)', letterSpacing: 1.6 }}>
          Plataforma
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 800 }}>JuntasCloud</Typography>
        <Typography sx={{ color: 'rgba(248, 250, 252, 0.68)', mt: 0.5 }} variant="body2">
          Gestión sobria y clara para la junta directiva.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(248, 250, 252, 0.08)' }} />

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
                color: 'rgba(248, 250, 252, 0.9)',
                mb: 0.75,
                '&.active, &.Mui-selected': {
                  backgroundColor: 'rgba(148, 163, 184, 0.18)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.12)',
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
            color: 'rgba(248, 250, 252, 0.9)',
            border: '1px solid rgba(248, 250, 252, 0.08)',
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 0 },
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
            borderRight: 0,
          },
        }}
        variant="permanent"
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
