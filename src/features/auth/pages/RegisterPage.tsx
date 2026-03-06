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
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import juntascloudCloudSvg from '../../../assets/juntascloud-cloud.svg';
import { useAuth } from '../../../auth/useAuth';
import { HttpError } from '../../../shared/api/httpClient';

type RegisterFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  nombres: string;
  apellidos: string;
};

type RegisterFormErrors = Record<keyof RegisterFormState, string>;

const initialFormState: RegisterFormState = {
  email: '',
  password: '',
  confirmPassword: '',
  nombres: '',
  apellidos: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldErrors(form: RegisterFormState): RegisterFormErrors {
  const normalizedEmail = form.email.trim();

  return {
    email: !normalizedEmail
      ? 'El email es obligatorio.'
      : !emailPattern.test(normalizedEmail)
        ? 'Ingresa un email valido.'
        : '',
    password: form.password.trim() ? '' : 'La contraseña es obligatoria.',
    confirmPassword: !form.confirmPassword.trim()
      ? 'Debes confirmar la contraseña.'
      : form.password !== form.confirmPassword
        ? 'Las contraseñas no coinciden.'
        : '',
    nombres: form.nombres.trim() ? '' : 'Los nombres son obligatorios.',
    apellidos: form.apellidos.trim() ? '' : 'Los apellidos son obligatorios.',
  };
}

function getFriendlyRegisterErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo crear la cuenta. Inténtalo nuevamente.';
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

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const errors = getFieldErrors(form);
  const hasValidationErrors = Object.values(errors).some(Boolean);
  const isSubmitDisabled = loading || Object.values(form).some((value) => !value.trim());

  if (isAuthenticated) {
    return <Navigate replace to="/app/juntas" />;
  }

  const handleChange =
    (field: keyof RegisterFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage(null);

    if (hasValidationErrors) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        email: form.email.trim(),
        password: form.password,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
      });

      navigate('/login', {
        replace: true,
        state: {
          authSuccessMessage: response.message,
        },
      });
    } catch (error) {
      setErrorMessage(getFriendlyRegisterErrorMessage(error));
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
              Crear cuenta
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              Completa todos los campos para registrar tu cuenta.
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
              autoComplete="given-name"
              autoFocus
              error={submitted && Boolean(errors.nombres)}
              fullWidth
              helperText={submitted ? errors.nombres : ' '}
              label="Nombres"
              onChange={handleChange('nombres')}
              required
              size="medium"
              value={form.nombres}
            />

            <TextField
              autoComplete="family-name"
              error={submitted && Boolean(errors.apellidos)}
              fullWidth
              helperText={submitted ? errors.apellidos : ' '}
              label="Apellidos"
              onChange={handleChange('apellidos')}
              required
              size="medium"
              value={form.apellidos}
            />

            <TextField
              autoComplete="email"
              error={submitted && Boolean(errors.email)}
              fullWidth
              helperText={submitted ? errors.email : ' '}
              label="Email"
              onChange={handleChange('email')}
              required
              size="medium"
              type="email"
              value={form.email}
            />

            <TextField
              autoComplete="new-password"
              error={submitted && Boolean(errors.password)}
              fullWidth
              helperText={submitted ? errors.password : ' '}
              label="Contraseña"
              onChange={handleChange('password')}
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
              value={form.password}
            />

            <TextField
              autoComplete="new-password"
              error={submitted && Boolean(errors.confirmPassword)}
              fullWidth
              helperText={submitted ? errors.confirmPassword : ' '}
              label="Confirmar contraseña"
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
              {loading ? <CircularProgress color="inherit" size={22} /> : 'Crear cuenta'}
            </Button>

            <Box
              sx={{
                color: 'text.secondary',
                fontSize: { xs: 14, sm: 15 },
                textAlign: 'center',
              }}
            >
              ¿Ya tienes una cuenta?{' '}
              <Box
                component={RouterLink}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                to="/login"
              >
                Inicia sesión
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
