import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { authApi } from '../../../api/auth.api';
import { HttpError } from '../../../shared/api/httpClient';

type ChangePasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordFormErrors = Record<keyof ChangePasswordFormState, string>;

const initialFormState: ChangePasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function getFieldErrors(form: ChangePasswordFormState): ChangePasswordFormErrors {
  return {
    currentPassword: form.currentPassword.trim() ? '' : 'La contraseña actual es obligatoria.',
    newPassword: form.newPassword.trim() ? '' : 'La nueva contraseña es obligatoria.',
    confirmPassword: !form.confirmPassword.trim()
      ? 'Debes confirmar la nueva contraseña.'
      : form.newPassword !== form.confirmPassword
        ? 'Las contraseñas no coinciden.'
        : '',
  };
}

function getFriendlyChangePasswordErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return error.message.trim() || 'Verifica los datos ingresados.';
    }

    if (error.status === 401) {
      return error.message.trim() || 'La contraseña actual es incorrecta.';
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return 'No se pudo actualizar la contraseña. Inténtalo nuevamente.';
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

export function AccountSecurityPage() {
  const [form, setForm] = useState<ChangePasswordFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errors = getFieldErrors(form);
  const hasValidationErrors = Object.values(errors).some(Boolean);
  const isSubmitDisabled = loading || Object.values(form).some((value) => !value.trim());

  const handleChange =
    (field: keyof ChangePasswordFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (hasValidationErrors) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccessMessage(
        response.message.trim()
          ? response.message
          : 'Tu contraseña fue actualizada correctamente.',
      );
      setForm(initialFormState);
      setSubmitted(false);
    } catch (error) {
      setErrorMessage(getFriendlyChangePasswordErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={0} sx={{ mt: { xs: 2, md: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4">Seguridad</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
          Actualiza tu contraseña usando tu clave actual y una nueva contraseña segura.
        </Typography>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            maxWidth: 520,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            autoComplete="current-password"
            error={submitted && Boolean(errors.currentPassword)}
            fullWidth
            helperText={submitted ? errors.currentPassword : ' '}
            label="Contraseña actual"
            onChange={handleChange('currentPassword')}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <PasswordAdornment
                    onToggle={() => setShowCurrentPassword((current) => !current)}
                    visible={showCurrentPassword}
                  />
                ),
              },
            }}
            type={showCurrentPassword ? 'text' : 'password'}
            value={form.currentPassword}
          />

          <TextField
            autoComplete="new-password"
            error={submitted && Boolean(errors.newPassword)}
            fullWidth
            helperText={submitted ? errors.newPassword : ' '}
            label="Nueva contraseña"
            onChange={handleChange('newPassword')}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <PasswordAdornment
                    onToggle={() => setShowNewPassword((current) => !current)}
                    visible={showNewPassword}
                  />
                ),
              },
            }}
            type={showNewPassword ? 'text' : 'password'}
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
            size="large"
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-start', minWidth: 220 }}
          >
            {loading ? <CircularProgress color="inherit" size={22} /> : 'Actualizar contraseña'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
