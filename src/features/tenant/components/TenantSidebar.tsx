import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import { Box, Divider, Drawer, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import {
  TenantNavAccordion,
  type TenantNavEntry,
} from './TenantNavAccordion';

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

function sectionHasActiveRoute(section: NavSection, pathname: string) {
  return section.entries.some((entry) => entry.to === pathname);
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
  const handleNavigate = isMobile ? onClose : undefined;

  const sections: NavSection[] = [
    {
      title: 'Dashboard',
      entries: [
        {
          label: 'Dashboard',
          to: `${tenantBasePath}/dashboard`,
          icon: <DashboardRoundedIcon />,
        },
      ],
    },
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
          label: 'Caja',
          to: `${tenantBasePath}/caja`,
          icon: <PaymentsRoundedIcon />,
        },
        {
          label: 'Ingresos / Gastos',
          icon: <PaymentsRoundedIcon />,
          disabled: true,
        },
        {
          label: 'Reporte mensual',
          to: `${tenantBasePath}/finanzas/reporte-mensual`,
          icon: <ArticleRoundedIcon />,
        },
        {
          label: 'Categorías',
          icon: <SettingsRoundedIcon />,
          disabled: true,
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

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2, minWidth: 0 }}>
        <Stack spacing={1.25}>
          {sections.map((section) => (
            <TenantNavAccordion
              defaultExpanded={isMobile ? sectionHasActiveRoute(section, location.pathname) : true}
              entries={section.entries}
              key={section.title}
              onNavigate={handleNavigate}
              title={section.title}
            />
          ))}
        </Stack>
      </Box>

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
