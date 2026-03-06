import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import juntascloudCloudSvg from '../../../assets/juntascloud-cloud.svg';
import { useAuth } from '../../../auth/useAuth';
import { HttpError } from '../../../shared/api/httpClient';

function getFriendlyVerifyEmailErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return 'No pudimos verificar tu correo. El enlace puede haber expirado o ya fue utilizado.';
}

export function VerifyEmailPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const hasRequestedRef = useRef(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : 'El enlace de verificación no es válido o está incompleto.',
  );

  useEffect(() => {
    if (!token || hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    const verify = async () => {
      try {
        const response = await authApi.verifyEmail({ token });
        const successMessage = response.message.trim()
          ? response.message
          : 'Tu correo fue verificado correctamente. Ya puedes iniciar sesión.';

        navigate('/login', {
          replace: true,
          state: {
            authSuccessMessage: successMessage,
          },
        });
      } catch (error) {
        setErrorMessage(getFriendlyVerifyEmailErrorMessage(error));
        setLoading(false);
      }
    };

    void verify();
  }, [navigate, token]);

  if (isAuthenticated) {
    return <Navigate replace to="/app/juntas" />;
  }

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
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
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
              mb: 1,
            }}
          >
            Verificar correo
          </Typography>

          {loading ? (
            <>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: 14, sm: 15 },
                  mb: 4,
                }}
              >
                Estamos verificando tu correo. Esto tomará solo un momento.
              </Typography>
              <CircularProgress size={32} />
            </>
          ) : (
            <>
              <Typography
                sx={{
                  color: 'error.main',
                  fontSize: 14,
                  mb: 2,
                }}
              >
                {errorMessage}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: 14, sm: 15 },
                  mb: 4,
                }}
              >
                Puedes volver a iniciar sesión o crear una cuenta nueva si todavía no has completado
                el registro.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button component={RouterLink} fullWidth size="large" to="/login" variant="contained">
                  Ir a iniciar sesión
                </Button>
                <Button component={RouterLink} fullWidth size="large" to="/register" variant="outlined">
                  Crear cuenta
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
