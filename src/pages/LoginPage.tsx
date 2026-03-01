import { Alert, Box, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoadingButton } from '../components/LoadingButton';
import { useAuth } from '../auth/useAuth';

function getFriendlyErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 400) {
      return 'Verifica los datos ingresados e inténtalo de nuevo.';
    }

    if (status === 401) {
      return 'Credenciales incorrectas';
    }

    if (status === 403) {
      return 'Usuario inactivo';
    }
  }

  return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('oscar@villaunion.pe');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate replace to={fromPath} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(fromPath, { replace: true });
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 3,
        background:
          'radial-gradient(circle at top left, rgba(15, 23, 42, 0.08), transparent 38%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 22px 70px rgba(15, 23, 42, 0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 1.6, color: 'primary.main' }}>
                Acceso seguro
              </Typography>
              <Typography sx={{ fontSize: { xs: 30, sm: 34 }, fontWeight: 800, lineHeight: 1.1 }}>
                Iniciar sesión
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                Ingresa a tu panel para gestionar juntas, personas y configuraciones clave.
              </Typography>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              autoComplete="email"
              autoFocus
              fullWidth
              label="Correo electrónico"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />

            <TextField
              autoComplete="current-password"
              fullWidth
              label="Contraseña"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />

            <LoadingButton
              fullWidth
              loading={loading}
              size="large"
              type="submit"
              variant="contained"
            >
              Iniciar sesión
            </LoadingButton>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
