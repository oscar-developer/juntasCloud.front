import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import type {
  CreateTenantPayload,
  Tenant,
  TenantDocumentType,
  TenantStatus,
} from '../types';

type DialogMode = 'create' | 'edit';

type TenantFormDialogProps = {
  open: boolean;
  mode?: DialogMode;
  initialValues?: Partial<Tenant>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTenantPayload) => Promise<void>;
};

type FormState = {
  nombre: string;
  tipoDocumento: TenantDocumentType;
  numeroDocumento: string;
  observaciones: string;
  estado: TenantStatus;
};

const defaultFormState: FormState = {
  nombre: '',
  tipoDocumento: 'RUC',
  numeroDocumento: '',
  observaciones: '',
  estado: 'ACTIVO',
};

function mapInitialValues(initialValues?: Partial<Tenant>): FormState {
  return {
    nombre: initialValues?.nombre ?? defaultFormState.nombre,
    tipoDocumento: initialValues?.tipoDocumento ?? defaultFormState.tipoDocumento,
    numeroDocumento: initialValues?.numeroDocumento ?? defaultFormState.numeroDocumento,
    observaciones: initialValues?.observaciones ?? defaultFormState.observaciones,
    estado: initialValues?.estado ?? defaultFormState.estado,
  };
}

function buildPayload(formState: FormState): CreateTenantPayload {
  const payload: CreateTenantPayload = {
    nombre: formState.nombre.trim(),
    tipoDocumento: formState.tipoDocumento,
    numeroDocumento: formState.numeroDocumento.trim(),
    estado: formState.estado,
  };

  const observaciones = formState.observaciones.trim();

  if (observaciones) {
    payload.observaciones = observaciones;
  }

  return payload;
}

export function TenantFormDialog({
  open,
  mode = 'create',
  initialValues,
  submitting,
  onClose,
  onSubmit,
}: TenantFormDialogProps) {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(mode === 'edit' ? mapInitialValues(initialValues) : defaultFormState);
    setTouched(false);
  }, [initialValues, mode, open]);

  const hasNameError = touched && !formState.nombre.trim();
  const hasDocumentNumberError = touched && !formState.numeroDocumento.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!formState.nombre.trim() || !formState.numeroDocumento.trim() || submitting) {
      return;
    }

    await onSubmit(buildPayload(formState));
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar junta' : 'Crear junta'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              error={hasNameError}
              fullWidth
              helperText={hasNameError ? 'El nombre es requerido.' : ' '}
              label="Nombre"
              onBlur={() => setTouched(true)}
              onChange={(event) =>
                setFormState((current) => ({ ...current, nombre: event.target.value }))
              }
              required
              value={formState.nombre}
            />
            <TextField
              fullWidth
              label="Tipo de documento"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  tipoDocumento: event.target.value as TenantDocumentType,
                }))
              }
              required
              select
              value={formState.tipoDocumento}
            >
              <MenuItem value="RUC">RUC</MenuItem>
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="OTRO">OTRO</MenuItem>
            </TextField>
            <TextField
              error={hasDocumentNumberError}
              fullWidth
              helperText={hasDocumentNumberError ? 'El numero de documento es requerido.' : ' '}
              label="Numero de documento"
              onBlur={() => setTouched(true)}
              onChange={(event) =>
                setFormState((current) => ({ ...current, numeroDocumento: event.target.value }))
              }
              required
              value={formState.numeroDocumento}
            />
            <TextField
              fullWidth
              label="Observaciones"
              minRows={3}
              multiline
              onChange={(event) =>
                setFormState((current) => ({ ...current, observaciones: event.target.value }))
              }
              value={formState.observaciones}
            />
            <TextField
              fullWidth
              label="Estado"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  estado: event.target.value as TenantStatus,
                }))
              }
              select
              value={formState.estado}
            >
              <MenuItem value="ACTIVO">ACTIVO</MenuItem>
              <MenuItem value="INACTIVO">INACTIVO</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={submitting} onClick={onClose} variant="text">
            Cancelar
          </Button>
          <Button
            disabled={submitting || !formState.nombre.trim() || !formState.numeroDocumento.trim()}
            type="submit"
            variant="contained"
          >
            {submitting ? <CircularProgress color="inherit" size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
