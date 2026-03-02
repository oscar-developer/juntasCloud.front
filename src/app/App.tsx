import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { setUnauthorizedHandler } from '../shared/auth/navigation';
import { AppRoutes } from './routes';

function UnauthorizedNavigationSync() {
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate('/login', { replace: true });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [navigate]);

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
