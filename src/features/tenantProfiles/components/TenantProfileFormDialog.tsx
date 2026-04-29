import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type {
  TenantProfile,
  TenantProfileCreateDto,
  TenantProfileFormMode,
} from '../types/tenantProfiles.types';

type TenantProfileFormDialogProps = {
  open: boolean;
  mode: TenantProfileFormMode;
  profile: TenantProfile | null;
  loading: boolean;
  submitting: boolean;
  loadError: string | null;
  onClose: () => void;
  onSubmit: (payload: TenantProfileCreateDto) => Promise<void> | void;
};

type FormState = {
  nombre: string;
  descripcion: string;
  activo: boolean;
};

type FormErrors = Record<'nombre', string>;

const initialFormState: FormState = {
  nombre: '',
  descripcion: '',
  activo: true,
};

function getFieldErrors(form: FormState): FormErrors {
  const nombre = form.nombre.trim();

  return {
    nombre: !nombre
      ? 'El nombre es obligatorio.'
      : nombre.length > 100
        ? 'El nombre no puede superar los 100 caracteres.'
        : '',
  };
}

export function TenantProfileFormDialog({
  open,
  mode,
  profile,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: TenantProfileFormDialogProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const errors = getFieldErrors(form);
  const hasValidationErrors = Object.values(errors).some(Boolean);
  const title = mode === 'edit' ? 'Editar perfil' : 'Nuevo perfil';

  useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitted(false);

    if (mode === 'edit' && profile) {
      setForm({
        nombre: profile.nombre,
        descripcion: profile.descripcion ?? '',
        activo: profile.activo,
      });
      return;
    }

    if (mode === 'create') {
      setForm(initialFormState);
    }
  }, [mode, open, profile]);

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'activo' ? (event.target as HTMLInputElement).checked : event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (hasValidationErrors) {
      return;
    }

    await onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      activo: form.activo,
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2">
          Define los datos generales del perfil. Los permisos se configuran desde la acción del listado.
        </Typography>

        {loading && <LinearProgress sx={{ mt: 2, borderRadius: 999 }} />}

        <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2} sx={{ mt: 3 }}>
          {loadError && <Alert severity="error">{loadError}</Alert>}

          <TextField
            autoFocus
            disabled={loading || submitting}
            error={submitted && Boolean(errors.nombre)}
            fullWidth
            helperText={submitted ? errors.nombre : ' '}
            label="Nombre"
            onChange={handleChange('nombre')}
            required
            slotProps={{ htmlInput: { maxLength: 100 } }}
            value={form.nombre}
          />

          <TextField
            disabled={loading || submitting}
            fullWidth
            label="Descripción"
            minRows={3}
            multiline
            onChange={handleChange('descripcion')}
            value={form.descripcion}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.activo}
                disabled={loading || submitting}
                onChange={handleChange('activo')}
              />
            }
            label="Perfil activo"
          />

          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button disabled={submitting} onClick={onClose} variant="text">
              Cancelar
            </Button>
            <Button disabled={loading || submitting} type="submit" variant="contained">
              {submitting ? <CircularProgress color="inherit" size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
