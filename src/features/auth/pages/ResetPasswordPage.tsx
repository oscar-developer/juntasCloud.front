import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import juntascloudCloudSvg from '../../../assets/juntascloud-cloud.svg';
import { HttpError } from '../../../shared/api/httpClient';

type ResetPasswordFormState = {
  newPassword: string;
  confirmPassword: string;
};

type ResetPasswordFormErrors = Record<keyof ResetPasswordFormState, string>;

const initialFormState: ResetPasswordFormState = {
  newPassword: '',
  confirmPassword: '',
};

function getFieldErrors(form: ResetPasswordFormState): ResetPasswordFormErrors {
  return {
    newPassword: form.newPassword.trim() ? '' : 'La nueva contraseña es obligatoria.',
    confirmPassword: !form.confirmPassword.trim()
      ? 'Debes confirmar la nueva contraseña.'
      : form.newPassword !== form.confirmPassword
        ? 'Las contraseñas no coinciden.'
        : '',
  };
}

function getFriendlyResetPasswordErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return error.message.trim() || 'El enlace no es válido, expiró o la contraseña no cumple las reglas.';
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return 'No se pudo restablecer la contraseña. Inténtalo nuevamente.';
}

function PasswordAdornment({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <InputAdornment position="end">
      <IconButton
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        edge="end"
        onClick={onToggle}
        onMouseDown={(event) => event.preventDefault()}
      >
        {visible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
      </IconButton>
    </InputAdornment>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [form, setForm] = useState<ResetPasswordFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : 'El enlace para restablecer la contraseña no es válido o está incompleto.',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errors = getFieldErrors(form);
  const hasValidationErrors = Object.values(errors).some(Boolean);
  const isSubmitDisabled = loading || !token || Object.values(form).some((value) => !value.trim());

  const handleChange =
    (field: keyof ResetPasswordFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('El enlace para restablecer la contraseña no es válido o está incompleto.');
      return;
    }

    if (hasValidationErrors) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: form.newPassword,
      });

      navigate('/login', {
        replace: true,
        state: {
          authSuccessMessage: response.message.trim()
            ? response.message
            : 'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.',
        },
      });
    } catch (error) {
      setErrorMessage(getFriendlyResetPasswordErrorMessage(error));
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
              Restablecer contraseña
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              Ingresa tu nueva contraseña para completar la recuperación de acceso.
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
              autoComplete="new-password"
              autoFocus
              error={submitted && Boolean(errors.newPassword)}
              fullWidth
              helperText={submitted ? errors.newPassword : ' '}
              label="Nueva contraseña"
              onChange={handleChange('newPassword')}
              required
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <PasswordAdornment
                      onToggle={() => setShowPassword((current) => !current)}
                      visible={showPassword}
                    />
                  ),
                },
              }}
              type={showPassword ? 'text' : 'password'}
              value={form.newPassword}
            />

            <TextField
              autoComplete="new-password"
              error={submitted && Boolean(errors.confirmPassword)}
              fullWidth
              helperText={submitted ? errors.confirmPassword : ' '}
              label="Confirmar nueva contraseña"
              onChange={handleChange('confirmPassword')}
              required
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <PasswordAdornment
                      onToggle={() => setShowConfirmPassword((current) => !current)}
                      visible={showConfirmPassword}
                    />
                  ),
                },
              }}
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
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
              {loading ? <CircularProgress color="inherit" size={22} /> : 'Actualizar contraseña'}
            </Button>

            <Box
              sx={{
                color: 'text.secondary',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              ¿Necesitas otro enlace?{' '}
              <Box
                component={RouterLink}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                to="/auth/forgot-password"
              >
                Solicitar recuperación
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
