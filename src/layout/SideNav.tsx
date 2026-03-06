import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { Avatar } from '@mui/material';
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
import { alpha } from '@mui/material/styles';
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
  { label: 'Juntas', path: '/app/juntas', icon: <DashboardRoundedIcon /> },
  { label: 'Invitaciones', path: '/app/invitations', icon: <MailOutlineRoundedIcon /> },
  { label: 'Ayuda', path: '/app/help', icon: <HelpOutlineRoundedIcon /> },
];

const accountItems: NavItem[] = [
  { label: 'Perfil', path: '/app/account/profile', icon: <PersonOutlineRoundedIcon /> },
  { label: 'Seguridad', path: '/app/account/security', icon: <SecurityRoundedIcon /> },
  { label: 'Historial de accesos', path: '/app/account/logins', icon: <LoginHistoryRoundedIcon /> },
];

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function SideNav({ drawerWidth, mobileOpen, onClose }: SideNavProps) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isAccountRoute = location.pathname.startsWith('/app/account/');
  const [accountOpen, setAccountOpen] = useState(isAccountRoute);
  const fullName = [user?.nombres, user?.apellidos].filter(Boolean).join(' ').trim();

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
      <Box
        sx={{
          px: 3,
          py: 3,
          background:
            'linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,1) 100%)',
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: 1.8, fontSize: 11, fontWeight: 700 }}
        >
          Plataforma
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 22, fontWeight: 800, lineHeight: 1.08 }}>
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
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 190, fontSize: 13.5 }} variant="body2">
          Accesos globales.
        </Typography>
        {user && (
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              mt: 1.25,
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha('#EB7A3C', 0.12),
                color: 'primary.main',
                fontSize: 12,
                fontWeight: 700,
                width: 32,
                height: 32,
                flexShrink: 0,
              }}
            >
              {getInitials(fullName || user.email)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {fullName || user.email}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2.5, flexGrow: 1 }}>
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
                mb: 1,
                minHeight: 52,
                color: selected ? 'primary.main' : 'text.primary',
                '& .MuiListItemText-primary': {
                  fontWeight: selected ? 700 : 600,
                },
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
            mt: 1.25,
            mb: 0.75,
            minHeight: 52,
            color: isAccountRoute ? 'primary.main' : 'text.primary',
            '& .MuiListItemText-primary': {
              fontWeight: isAccountRoute ? 700 : 600,
            },
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
                    pl: 4.75,
                    minHeight: 46,
                    mb: 0.5,
                    color: selected ? 'primary.main' : 'text.secondary',
                    '& .MuiListItemText-primary': {
                      fontSize: 14,
                      fontWeight: selected ? 700 : 500,
                    },
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
                mt: 1.25,
                minHeight: 52,
                color: selected ? 'primary.main' : 'text.primary',
                '& .MuiListItemText-primary': {
                  fontWeight: selected ? 700 : 600,
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
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 52,
            bgcolor: alpha('#F8FAFC', 0.9),
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
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
            boxShadow: '6px 0 24px rgba(15, 23, 42, 0.04)',
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
            boxShadow: '6px 0 24px rgba(15, 23, 42, 0.04)',
          },
        }}
        variant="permanent"
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
