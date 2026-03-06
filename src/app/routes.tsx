import { Navigate, useParams, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AccountLoginsPage } from '../features/account/pages/AccountLoginsPage';
import { AccountProfilePage } from '../features/account/pages/AccountProfilePage';
import { AccountSecurityPage } from '../features/account/pages/AccountSecurityPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { HelpPage } from '../features/help/pages/HelpPage';
import { InvitationsPage } from '../features/invitations/pages/InvitationsPage';
import { JuntasListPage } from '../features/juntas/pages/JuntasListPage';
import { TenantProvider } from '../features/tenant/context/TenantContext';
import { TenantLayout } from '../features/tenant/layout/TenantLayout';
import { tenantRouteChildren } from '../features/tenant/routes/tenantRoutes';
import { AppLayout } from '../layout/AppLayout';

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
