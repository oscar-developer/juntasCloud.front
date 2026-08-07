import { Navigate, useParams, useRoutes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AccountLoginsPage } from '../features/account/pages/AccountLoginsPage';
import { AccountProfilePage } from '../features/account/pages/AccountProfilePage';
import { AccountSecurityPage } from '../features/account/pages/AccountSecurityPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { HelpPage } from '../features/help/pages/HelpPage';
import { InvitationsPage } from '../features/invitations/pages/InvitationsPage';
import { JuntasListPage } from '../features/juntas/pages/JuntasListPage';
import { TenantTrashPage } from '../features/juntas/pages/TenantTrashPage';
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
      path: '/auth/forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      path: '/verify-email',
      element: <VerifyEmailPage />,
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
              path: 'juntas/papelera',
              element: <TenantTrashPage />,
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
