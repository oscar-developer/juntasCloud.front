import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LoginHistoryRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface SideNavProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const primaryItems: NavItem[] = [
  { label: 'Juntas', path: '/app/tenants', icon: <DashboardRoundedIcon /> },
  { label: 'Invitaciones', path: '/app/invitations', icon: <MailOutlineRoundedIcon /> },
  { label: 'Ayuda', path: '/app/help', icon: <HelpOutlineRoundedIcon /> },
];

const accountItems: NavItem[] = [
  { label: 'Perfil', path: '/app/account/profile', icon: <PersonOutlineRoundedIcon /> },
  { label: 'Seguridad', path: '/app/account/security', icon: <SecurityRoundedIcon /> },
  { label: 'Historial de accesos', path: '/app/account/logins', icon: <LoginHistoryRoundedIcon /> },
];

export function SideNav({ drawerWidth, mobileOpen, onClose }: SideNavProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const isAccountRoute = location.pathname.startsWith('/app/account/');
  const [accountOpen, setAccountOpen] = useState(isAccountRoute);

  useEffect(() => {
    if (isAccountRoute) {
      setAccountOpen(true);
    }
  }, [isAccountRoute]);

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
          Accesos globales y navegación general de tu cuenta.
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {primaryItems.slice(0, 2).map((item) => {
          const selected = location.pathname === item.path;

          return (
            <ListItemButton
              component={NavLink}
              key={item.path}
              onClick={onClose}
              selected={selected}
              to={item.path}
              sx={{
                mb: 0.75,
                color: selected ? 'primary.main' : 'text.primary',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}

        <ListItemButton
          onClick={() => setAccountOpen((current) => !current)}
          selected={isAccountRoute}
          sx={{
            mb: 0.75,
            color: isAccountRoute ? 'primary.main' : 'text.primary',
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <PersonOutlineRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Mi cuenta" />
          {accountOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </ListItemButton>

        <Collapse in={accountOpen} timeout="auto" unmountOnExit>
          <List disablePadding>
            {accountItems.map((item) => {
              const selected = location.pathname === item.path;

              return (
                <ListItemButton
                  component={NavLink}
                  key={item.path}
                  onClick={onClose}
                  selected={selected}
                  to={item.path}
                  sx={{
                    pl: 4.5,
                    mb: 0.5,
                    color: selected ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>

        {primaryItems.slice(2).map((item) => {
          const selected = location.pathname === item.path;

          return (
            <ListItemButton
              component={NavLink}
              key={item.path}
              onClick={onClose}
              selected={selected}
              to={item.path}
              sx={{
                mt: 0.5,
                color: selected ? 'primary.main' : 'text.primary',
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
