import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import juntascloudCloudSvg from '../../../assets/juntascloud-cloud.svg';
import { useAuth } from '../../../auth/useAuth';
import { HttpError } from '../../../shared/api/httpClient';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForgotPasswordLocationState = {
  email?: string;
  from?: { pathname?: string };
} | null;

function getEmailError(email: string) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return 'El email es obligatorio.';
  }

  if (!emailPattern.test(normalizedEmail)) {
    return 'Ingresa un email valido.';
  }

  return '';
}

function getFriendlyForgotPasswordErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return error.message.trim() || 'Ingresa un email valido.';
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return 'No se pudo solicitar la recuperación. Inténtalo nuevamente.';
}

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const locationState = location.state as ForgotPasswordLocationState;
  const backToLoginState = locationState?.from ? { from: locationState.from } : null;
  const [email, setEmail] = useState(locationState?.email?.trim() ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailError = getEmailError(email);
  const isSubmitDisabled = loading || !email.trim();

  if (isAuthenticated) {
    return <Navigate replace to="/app/juntas" />;
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);

    if (emailError) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email: email.trim() });

      setSuccessMessage(
        response.message.trim()
          ? response.message
          : 'Si el correo existe, enviaremos instrucciones para restablecer tu contraseña.',
      );
    } catch (error) {
      setErrorMessage(getFriendlyForgotPasswordErrorMessage(error));
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
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 520,
          borderRadius: { xs: 3, sm: 4 },
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          boxShadow: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
        }}
      >
        <Box
          component="form"
          noValidate
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
                  color: 'text.primary',
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
                    color: 'text.secondary',
                  }}
                >
                  Cloud
                </Box>
              </Typography>
            </Box>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: { xs: 28, sm: 34 },
                fontWeight: 700,
                lineHeight: 1.1,
                textAlign: 'center',
                mb: 1,
              }}
            >
              Recuperar contraseña
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              Ingresa tu email y te enviaremos las instrucciones para restablecer tu acceso.
            </Typography>
          </Box>

          {successMessage ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                alignItems: 'stretch',
              }}
            >
              <Typography
                sx={{
                  color: 'success.main',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                {successMessage}
              </Typography>

              <Button
                component={RouterLink}
                fullWidth
                size="large"
                state={backToLoginState}
                to="/login"
                variant="contained"
              >
                Volver a iniciar sesión
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {errorMessage && (
                <Typography
                  sx={{
                    color: 'error.main',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  {errorMessage}
                </Typography>
              )}

              <TextField
                autoComplete="email"
                autoFocus
                error={submitted && Boolean(emailError)}
                fullWidth
                helperText={submitted ? emailError : ' '}
                label="Email"
                onChange={handleEmailChange}
                required
                size="medium"
                type="email"
                value={email}
              />

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
                  fontSize: 16,
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {loading ? <CircularProgress color="inherit" size={22} /> : 'Enviar instrucciones'}
              </Button>

              <Box
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: 14, sm: 15 },
                  textAlign: 'center',
                }}
              >
                ¿Recordaste tu contraseña?{' '}
                <Box
                  component={RouterLink}
                  state={backToLoginState}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  to="/login"
                >
                  Volver al login
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
