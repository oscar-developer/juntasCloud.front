import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { CreateTenantInvitationRequest, InvitationRole } from '../types';

type TenantInvitationFormDialogProps = {
  open: boolean;
  loading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateTenantInvitationRequest) => Promise<void> | void;
};

type InvitationFormState = {
  email: string;
  role: InvitationRole;
};

type InvitationFormErrors = Record<keyof InvitationFormState, string>;

const initialFormState: InvitationFormState = {
  email: '',
  role: 'MEMBER',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldErrors(form: InvitationFormState): InvitationFormErrors {
  const normalizedEmail = form.email.trim();

  return {
    email: !normalizedEmail
      ? 'El email es obligatorio.'
      : !emailPattern.test(normalizedEmail)
        ? 'Ingresa un email valido.'
        : '',
    role: form.role ? '' : 'Selecciona un rol.',
  };
}

export function TenantInvitationFormDialog({
  open,
  loading,
  errorMessage,
  onClose,
  onSubmit,
}: TenantInvitationFormDialogProps) {
  const [form, setForm] = useState<InvitationFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const errors = getFieldErrors(form);
  const hasValidationErrors = Object.values(errors).some(Boolean);
  const isSubmitDisabled = loading || !form.email.trim() || !form.role;

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialFormState);
    setSubmitted(false);
  }, [open]);

  const handleChange =
    (field: keyof InvitationFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (hasValidationErrors) {
      return;
    }

    await onSubmit({
      email: form.email.trim(),
      role: form.role,
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={loading ? undefined : onClose} open={open}>
      <DialogTitle>Nueva invitación</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2">
          Invita a un usuario nuevo a la junta seleccionada indicando su correo y rol inicial.
        </Typography>

        <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2} sx={{ mt: 3 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            autoComplete="email"
            autoFocus
            error={submitted && Boolean(errors.email)}
            fullWidth
            helperText={submitted ? errors.email : ' '}
            label="Email"
            onChange={handleChange('email')}
            required
            type="email"
            value={form.email}
          />

          <TextField
            error={submitted && Boolean(errors.role)}
            fullWidth
            helperText={submitted ? errors.role : ' '}
            label="Rol"
            onChange={handleChange('role')}
            required
            select
            value={form.role}
          >
            <MenuItem value="MEMBER">Miembro</MenuItem>
            <MenuItem value="ADMIN">Administrador</MenuItem>
          </TextField>

          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button disabled={loading} onClick={onClose} variant="text">
              Cancelar
            </Button>
            <Button disabled={isSubmitDisabled} type="submit" variant="contained">
              {loading ? <CircularProgress color="inherit" size={20} /> : 'Enviar invitación'}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
