import { Navigate, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AppLayout } from '../layout/AppLayout';
import { AccountLoginsPage } from '../pages/AccountLoginsPage';
import { AccountProfilePage } from '../pages/AccountProfilePage';
import { AccountSecurityPage } from '../pages/AccountSecurityPage';
import { HelpPage } from '../pages/HelpPage';
import { InvitationsPage } from '../pages/InvitationsPage';
import { LoginPage } from '../pages/LoginPage';
import { TenantDashboardPage } from '../pages/TenantDashboardPage';
import { TenantsPage } from '../pages/TenantsPage';

export function AppRoutes() {
  return useRoutes([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <Navigate replace to="/app/tenants" />,
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
              element: <Navigate replace to="/app/tenants" />,
            },
            {
              path: 'tenants',
              element: <TenantsPage />,
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
      ],
    },
    {
      path: '/t/:tenantId/dashboard',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: <TenantDashboardPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate replace to="/app/tenants" />,
    },
  ]);
}
