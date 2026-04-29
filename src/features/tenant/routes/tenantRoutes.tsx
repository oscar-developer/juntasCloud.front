import { Navigate, type RouteObject } from 'react-router-dom';
import { AsambleaAsistenciaPage } from '../../asambleaAsistencia/pages/AsambleaAsistenciaPage';
import { AsambleasPage } from '../../asambleas/pages/AsambleasPage';
import { BienesPage } from '../../bienes/pages/BienesPage';
import { FaenaAsistenciaPage } from '../../faenaAsistencia/pages/FaenaAsistenciaPage';
import { FaenasPage } from '../../faenas/pages/FaenasPage';
import { CajaPage } from '../../finanzas/caja/pages/CajaPage';
import { CategoriasCajaPage } from '../../finanzas/categoriasCaja/pages/CategoriasCajaPage';
import { ConceptosCobroPage } from '../../finanzas/conceptosCobro/pages/ConceptosCobroPage';
import { CreditosPage } from '../../finanzas/creditos/pages/CreditosPage';
import { ObligacionesPage } from '../../finanzas/obligaciones/pages/ObligacionesPage';
import { PagosPage } from '../../finanzas/pagos/pages/PagosPage';
import { ReporteMensualPage } from '../../finanzas/reporteMensual/pages/ReporteMensualPage';
import { ResumenFinancieroPage } from '../../finanzas/resumen/pages/ResumenFinancieroPage';
import { JuntaMiembrosPage } from '../../juntaMiembros/pages/JuntaMiembrosPage';
import { JuntasDirectivasPage } from '../../juntasDirectivas/pages/JuntasDirectivasPage';
import { PersonaTerrenoPage } from '../../personaTerreno/pages/PersonaTerrenoPage';
import { PersonasPage } from '../../personas/pages/PersonasPage';
import { TerrenosPage } from '../../terrenos/pages/TerrenosPage';
import { TenantInvitationsPage } from '../../tenantAdmin/pages/TenantInvitationsPage';
import { TenantMembersPage } from '../../tenantAdmin/pages/TenantMembersPage';
import { TenantPerfilesPage } from '../../tenantAdmin/pages/TenantRolesPage';
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
    element: <Navigate replace to="finanzas/caja" />,
  },
  {
    path: 'finanzas/resumen',
    element: <ResumenFinancieroPage />,
  },
  {
    path: 'finanzas/caja',
    element: <CajaPage />,
  },
  {
    path: 'finanzas/obligaciones',
    element: <ObligacionesPage />,
  },
  {
    path: 'finanzas/pagos',
    element: <PagosPage />,
  },
  {
    path: 'finanzas/creditos',
    element: <CreditosPage />,
  },
  {
    path: 'finanzas/conceptos-cobro',
    element: <ConceptosCobroPage />,
  },
  {
    path: 'finanzas/categorias-caja',
    element: <CategoriasCajaPage />,
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
    path: 'admin/perfiles',
    element: <TenantPerfilesPage />,
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
