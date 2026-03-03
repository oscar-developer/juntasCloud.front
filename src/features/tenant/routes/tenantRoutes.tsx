import { Navigate, type RouteObject } from 'react-router-dom';
import { AsambleaAsistenciaPage } from '../../asambleaAsistencia/pages/AsambleaAsistenciaPage';
import { AsambleasPage } from '../../asambleas/pages/AsambleasPage';
import { BienesPage } from '../../bienes/pages/BienesPage';
import { CajaPage } from '../../caja/pages/CajaPage';
import { FaenaAsistenciaPage } from '../../faenaAsistencia/pages/FaenaAsistenciaPage';
import { FaenasPage } from '../../faenas/pages/FaenasPage';
import { ReporteMensualPage } from '../../finanzas/pages/ReporteMensualPage';
import { JuntaMiembrosPage } from '../../juntaMiembros/pages/JuntaMiembrosPage';
import { JuntasDirectivasPage } from '../../juntasDirectivas/pages/JuntasDirectivasPage';
import { PersonaTerrenoPage } from '../../personaTerreno/pages/PersonaTerrenoPage';
import { PersonasPage } from '../../personas/pages/PersonasPage';
import { TerrenosPage } from '../../terrenos/pages/TerrenosPage';
import { TenantInvitationsPage } from '../../tenantAdmin/pages/TenantInvitationsPage';
import { TenantMembersPage } from '../../tenantAdmin/pages/TenantMembersPage';
import { TenantRolesPage } from '../../tenantAdmin/pages/TenantRolesPage';
import { TenantSettingsPage } from '../../tenantAdmin/pages/TenantSettingsPage';
import { TenantDashboardPage } from '../../tenantDashboard/pages/TenantDashboardPage';

export const tenantRouteChildren: RouteObject[] = [
  {
    index: true,
    element: <Navigate replace to="dashboard" />,
  },
  {
    path: 'dashboard',
    element: <TenantDashboardPage />,
  },
  {
    path: 'personas',
    element: <PersonasPage />,
  },
  {
    path: 'terrenos',
    element: <TerrenosPage />,
  },
  {
    path: 'persona-terreno',
    element: <PersonaTerrenoPage />,
  },
  {
    path: 'bienes',
    element: <BienesPage />,
  },
  {
    path: 'juntas-directivas',
    element: <JuntasDirectivasPage />,
  },
  {
    path: 'junta-miembros',
    element: <JuntaMiembrosPage />,
  },
  {
    path: 'faenas',
    element: <FaenasPage />,
  },
  {
    path: 'faena-asistencia',
    element: <FaenaAsistenciaPage />,
  },
  {
    path: 'asambleas',
    element: <AsambleasPage />,
  },
  {
    path: 'asamblea-asistencia',
    element: <AsambleaAsistenciaPage />,
  },
  {
    path: 'caja',
    element: <CajaPage />,
  },
  {
    path: 'finanzas/reporte-mensual',
    element: <ReporteMensualPage />,
  },
  {
    path: 'admin/miembros',
    element: <TenantMembersPage />,
  },
  {
    path: 'admin/invitaciones',
    element: <TenantInvitationsPage />,
  },
  {
    path: 'admin/roles',
    element: <TenantRolesPage />,
  },
  {
    path: 'admin/configuracion',
    element: <TenantSettingsPage />,
  },
  {
    path: '*',
    element: <Navigate replace to="dashboard" />,
  },
];
