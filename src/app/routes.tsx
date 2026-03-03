import { Navigate, useParams, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { JuntasListPage } from '../features/juntas/pages/JuntasListPage';
import { TenantProvider } from '../features/tenant/context/TenantContext';
import { TenantLayout } from '../features/tenant/layout/TenantLayout';
import { tenantRouteChildren } from '../features/tenant/routes/tenantRoutes';
import { AppLayout } from '../layout/AppLayout';
import { AccountLoginsPage } from '../pages/AccountLoginsPage';
import { AccountProfilePage } from '../pages/AccountProfilePage';
import { AccountSecurityPage } from '../pages/AccountSecurityPage';
import { HelpPage } from '../pages/HelpPage';
import { InvitationsPage } from '../pages/InvitationsPage';
import { LoginPage } from '../pages/LoginPage';

function LegacyTenantRedirect() {
  const { tenantId } = useParams<{ tenantId: string }>();

  if (!tenantId) {
    return <Navigate replace to="/app/juntas" />;
  }

  return <Navigate replace to={`/app/juntas/${tenantId}/dashboard`} />;
}

export function AppRoutes() {
  return useRoutes([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <Navigate replace to="/app/juntas" />,
    },
    {
      path: '/app',
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              index: true,
              element: <Navigate replace to="/app/juntas" />,
            },
            {
              path: 'tenants',
              element: <Navigate replace to="/app/juntas" />,
            },
            {
              path: 'juntas',
              element: <JuntasListPage />,
            },
            {
              path: 'invitations',
              element: <InvitationsPage />,
            },
            {
              path: 'account/profile',
              element: <AccountProfilePage />,
            },
            {
              path: 'account/security',
              element: <AccountSecurityPage />,
            },
            {
              path: 'account/logins',
              element: <AccountLoginsPage />,
            },
            {
              path: 'help',
              element: <HelpPage />,
            },
          ],
        },
        {
          path: 'juntas/:tenantId',
          element: (
            <TenantProvider>
              <TenantLayout />
            </TenantProvider>
          ),
          children: tenantRouteChildren,
        },
      ],
    },
    {
      path: '/t/:tenantId/*',
      element: <LegacyTenantRedirect />,
    },
    {
      path: '*',
      element: <Navigate replace to="/app/juntas" />,
    },
  ]);
}
