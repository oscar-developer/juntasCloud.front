import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import juntascloudCloudSvg from '../assets/juntascloud-cloud.svg';
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
  // const [email, setEmail] = useState('oscar@villaunion.pe');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
  const isSubmitDisabled = loading || !email.trim() || !password.trim();

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        backgroundColor: '#f3f4f6',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: { xs: 3, sm: 4 },
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          boxShadow: {
            xs: '0 12px 30px rgba(15, 23, 42, 0.08)',
            sm: '0 20px 48px rgba(15, 23, 42, 0.10)',
          },
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.25,
                mb: 4,
              }}
            >
              <Box
                alt="JuntasCloud"
                component="img"
                src={juntascloudCloudSvg}
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: 'auto',
                  display: 'block',
                }}
              />
              <Typography
                sx={{
                  color: '#1f2937',
                  // fontSize: { xs: 20, sm: 22 },
                  fontSize: { xs: 25, sm: 28 },
                  lineHeight: 1,
                }}
              >
                <Box component="span" sx={{ fontWeight: 700 }}>
                  Juntas
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontWeight: 400,
                    color: '#4b5563',
                  }}
                >
                  Cloud
                </Box>
              </Typography>
            </Box>
            <Typography
              sx={{
                color: '#1f2937',
                fontSize: { xs: 32, sm: 36 },
                fontWeight: 700,
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              Bienvenido
            </Typography>
          </Box>

          {errorMessage && (
            <Typography
              sx={{
                mb: 2,
                color: 'error.main',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoComplete="email"
              autoFocus
              fullWidth
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
              }}
              type="email"
              value={email}
            />

            <TextField
              autoComplete="current-password"
              fullWidth
              label="Contraseña"
              onChange={(event) => setPassword(event.target.value)}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        edge="end"
                        onClick={() => setShowPassword((current) => !current)}
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              type={showPassword ? 'text' : 'password'}
              value={password}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#374151',
              }}
            >
              <Checkbox
                checked={rememberMe}
                disableRipple
                onChange={(event) => setRememberMe(event.target.checked)}
                sx={{
                  p: 0,
                  color: '#9ca3af',
                  '&.Mui-checked': {
                    color: '#eb7a3c',
                  },
                }}
              />
              <Typography sx={{ fontSize: 16 }}>Recordarme</Typography>
            </Box>

            <Button
              disabled={isSubmitDisabled}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              sx={{
                minHeight: 52,
                mt: 0.5,
                borderRadius: 1.5,
                boxShadow: 'none',
                backgroundColor: '#eb7a3c',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#d9682e',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f3b18d',
                  color: '#ffffff',
                },
              }}
            >
              {loading ? <CircularProgress color="inherit" size={22} /> : 'Iniciar sesión'}
            </Button>

            <Typography
              sx={{
                color: '#374151',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              ¿No tienes una cuenta?{' '}
              <Box
                component="a"
                href="#"
                sx={{
                  color: '#eb7a3c',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Crear cuenta
              </Box>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
