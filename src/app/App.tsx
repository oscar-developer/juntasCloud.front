import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { useAuth } from '../auth/useAuth';
import { setUnauthorizedHandler } from '../shared/auth/navigation';
import { AppRoutes } from './routes';

function UnauthorizedNavigationSync() {
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      handleUnauthorized();
      navigate('/login', { replace: true });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [handleUnauthorized, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UnauthorizedNavigationSync />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
