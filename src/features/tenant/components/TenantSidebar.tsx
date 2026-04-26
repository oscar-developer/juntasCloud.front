import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
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
import { useTenant } from '../context/TenantContext';

type TenantSidebarProps = {
  drawerWidth: number;
  isMobile: boolean;
  mobileOpen: boolean;
  onClose: () => void;
};

type NavSection = {
  title: string;
  entries: TenantNavEntry[];
};

type TenantNavEntry = {
  label: string;
  to?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

function sectionHasActiveRoute(section: NavSection, pathname: string) {
  return section.entries.some((entry) => entry.to === pathname);
}

function getActiveSectionTitle(sections: NavSection[], pathname: string) {
  return sections.find((section) => sectionHasActiveRoute(section, pathname))?.title ?? null;
}

export function TenantSidebar({
  drawerWidth,
  isMobile,
  mobileOpen,
  onClose,
}: TenantSidebarProps) {
  const location = useLocation();
  const { isAdmin, tenantId, tenant } = useTenant();
  const tenantBasePath = `/app/juntas/${tenantId}`;
  const dashboardPath = `${tenantBasePath}/dashboard`;
  const handleNavigate = isMobile ? onClose : undefined;
  const dashboardEntry: TenantNavEntry = {
    label: 'Dashboard',
    to: dashboardPath,
    icon: <DashboardRoundedIcon />,
  };

  const sections: NavSection[] = [
    {
      title: 'Catálogos',
      entries: [
        {
          label: 'Personas',
          to: `${tenantBasePath}/personas`,
          icon: <GroupRoundedIcon />,
        },
        {
          label: 'Terrenos',
          to: `${tenantBasePath}/terrenos`,
          icon: <HomeWorkRoundedIcon />,
        },
        {
          label: 'Relación Persona–Terreno',
          to: `${tenantBasePath}/persona-terreno`,
          icon: <AccountTreeRoundedIcon />,
        },
        {
          label: 'Bienes',
          to: `${tenantBasePath}/bienes`,
          icon: <Inventory2RoundedIcon />,
        },
      ],
    },
    {
      title: 'Gestión / Organización',
      entries: [
        {
          label: 'Juntas Directivas',
          to: `${tenantBasePath}/juntas-directivas`,
          icon: <Diversity3RoundedIcon />,
        },
        {
          label: 'Miembros de Junta',
          to: `${tenantBasePath}/junta-miembros`,
          icon: <SupervisorAccountRoundedIcon />,
        },
      ],
    },
    {
      title: 'Eventos y Asistencia',
      entries: [
        {
          label: 'Faenas',
          to: `${tenantBasePath}/faenas`,
          icon: <HandymanRoundedIcon />,
        },
        {
          label: 'Asistencia faena',
          to: `${tenantBasePath}/faena-asistencia`,
          icon: <AssignmentTurnedInRoundedIcon />,
        },
        {
          label: 'Asambleas',
          to: `${tenantBasePath}/asambleas`,
          icon: <CalendarMonthRoundedIcon />,
        },
        {
          label: 'Asistencia asamblea',
          to: `${tenantBasePath}/asamblea-asistencia`,
          icon: <ArticleRoundedIcon />,
        },
      ],
    },
    {
      title: 'Finanzas',
      entries: [
        {
          label: 'Resumen financiero',
          to: `${tenantBasePath}/finanzas/resumen`,
          icon: <ArticleRoundedIcon />,
        },
        {
          label: 'Caja',
          to: `${tenantBasePath}/finanzas/caja`,
          icon: <PaymentsRoundedIcon />,
        },
        {
          label: 'Obligaciones / Cobranza',
          to: `${tenantBasePath}/finanzas/obligaciones`,
          icon: <ReceiptLongRoundedIcon />,
        },
        {
          label: 'Pagos',
          to: `${tenantBasePath}/finanzas/pagos`,
          icon: <PaymentsRoundedIcon />,
        },
        {
          label: 'Créditos',
          to: `${tenantBasePath}/finanzas/creditos`,
          icon: <SavingsRoundedIcon />,
        },
      ],
    },
    {
      title: 'Configuración financiera',
      entries: [
        {
          label: 'Conceptos de cobro',
          to: `${tenantBasePath}/finanzas/conceptos-cobro`,
          icon: <ReceiptLongRoundedIcon />,
        },
        {
          label: 'Categorías de caja',
          to: `${tenantBasePath}/finanzas/categorias-caja`,
          icon: <SettingsRoundedIcon />,
        },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      title: 'Administración',
      entries: [
        {
          label: 'Usuarios y accesos',
          icon: <DoorFrontRoundedIcon />,
          disabled: true,
        },
        {
          label: 'Miembros del tenant',
          to: `${tenantBasePath}/admin/miembros`,
          icon: <GroupRoundedIcon />,
        },
        {
          label: 'Invitaciones',
          to: `${tenantBasePath}/admin/invitaciones`,
          icon: <ArticleRoundedIcon />,
        },
        {
          label: 'Roles',
          to: `${tenantBasePath}/admin/roles`,
          icon: <SupervisorAccountRoundedIcon />,
        },
        {
          label: 'Configuración de la junta',
          to: `${tenantBasePath}/admin/configuracion`,
          icon: <SettingsRoundedIcon />,
        },
      ],
    });
  }

  const [openSectionTitle, setOpenSectionTitle] = useState<string | null>(() =>
    getActiveSectionTitle(sections, location.pathname),
  );

  useEffect(() => {
    setOpenSectionTitle(getActiveSectionTitle(sections, location.pathname));
  }, [isAdmin, location.pathname, tenantBasePath]);

  const toggleSection = (title: string) => {
    setOpenSectionTitle((current) => (current === title ? null : title));
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3,
          minWidth: 0,
          background:
            'linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,1) 100%)',
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: 1.8, fontSize: 11, fontWeight: 700 }}
        >
          Tenant Mode
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.08,
            overflowWrap: 'anywhere',
          }}
        >
          {tenant?.nombre ?? 'Junta'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, fontSize: 13.5 }} variant="body2">
          Navegación interna por módulos del tenant.
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2.5, flexGrow: 1, overflowY: 'auto', minWidth: 0 }}>
        <ListItemButton
          component={NavLink}
          onClick={handleNavigate}
          selected={location.pathname === dashboardPath}
          to={dashboardPath}
          sx={{
            mb: 1.25,
            minHeight: 52,
            color: location.pathname === dashboardPath ? 'primary.main' : 'text.primary',
            '& .MuiListItemText-primary': {
              fontWeight: location.pathname === dashboardPath ? 700 : 600,
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{dashboardEntry.icon}</ListItemIcon>
          <ListItemText primary={dashboardEntry.label} />
        </ListItemButton>

        {sections.map((section) => {
          const isSectionActive = sectionHasActiveRoute(section, location.pathname);
          const isOpen = openSectionTitle === section.title;

          return (
            <Box key={section.title} sx={{ mb: 0.75 }}>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                selected={isSectionActive}
                sx={{
                  minHeight: 52,
                  color: isSectionActive ? 'primary.main' : 'text.primary',
                  '& .MuiListItemText-primary': {
                    fontWeight: isSectionActive ? 700 : 600,
                  },
                }}
              >
                <ListItemText primary={section.title} />
                {isOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {section.entries.map((entry) => {
                    const entryTo = entry.to;
                    const selected = Boolean(entryTo) && location.pathname === entryTo;

                    if (!entryTo || entry.disabled) {
                      return (
                        <ListItemButton
                          disabled
                          key={entry.label}
                          sx={{
                            pl: 4.75,
                            minHeight: 46,
                            mb: 0.5,
                            opacity: 0.72,
                            color: 'text.disabled',
                            '& .MuiListItemText-primary': {
                              fontSize: 14,
                              fontWeight: 500,
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{entry.icon}</ListItemIcon>
                          <ListItemText primary={entry.label} />
                        </ListItemButton>
                      );
                    }

                    return (
                      <ListItemButton
                        component={NavLink}
                        key={entryTo}
                        onClick={handleNavigate}
                        selected={selected}
                        to={entryTo}
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
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{entry.icon}</ListItemIcon>
                        <ListItemText primary={entry.label} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      <Stack sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography
          color="text.secondary"
          sx={{
            px: 1,
            py: 1,
            borderRadius: 2,
            bgcolor: alpha('#F8FAFC', 0.9),
            fontSize: 12.5,
            overflowWrap: 'anywhere',
          }}
          variant="body2"
        >
          tenantId: {tenantId}
        </Typography>
      </Stack>
    </Box>
  );

  const paperWidth = isMobile ? 'min(280px, 88vw)' : `${drawerWidth}px`;

  return (
    <Drawer
      ModalProps={{ keepMounted: true }}
      onClose={onClose}
      open={isMobile ? mobileOpen : true}
      sx={{
        display: 'block',
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: paperWidth,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: isMobile ? '10px 0 28px rgba(15, 23, 42, 0.12)' : '6px 0 24px rgba(15, 23, 42, 0.04)',
        },
      }}
      variant={isMobile ? 'temporary' : 'permanent'}
    >
      {drawerContent}
    </Drawer>
  );
}
