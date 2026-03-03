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
import { HttpError } from '../../../shared/api/httpClient';
import { createTenant, updateTenant } from '../services/juntasApi';
import type { CreateTenantPayload, Tenant, TenantStatus } from '../types';

type MessageSeverity = 'success' | 'error';
type DialogMode = 'create' | 'edit';

type TenantFormDialogProps = {
  open: boolean;
  mode?: DialogMode;
  initialValues?: Partial<Tenant>;
  onClose: () => void;
  onCreated: (tenant: Tenant) => void;
  onUpdated: (tenant: Tenant) => void;
  onShowMessage: (message: string, severity: MessageSeverity) => void;
};

type FormState = {
  nombre: string;
  ruc: string;
  dni: string;
  observaciones: string;
  estado: TenantStatus;
};

const defaultFormState: FormState = {
  nombre: '',
  ruc: '',
  dni: '',
  observaciones: '',
  estado: 'ACTIVO',
};

function mapInitialValues(initialValues?: Partial<Tenant>): FormState {
  return {
    nombre: initialValues?.nombre ?? defaultFormState.nombre,
    ruc: initialValues?.ruc ?? defaultFormState.ruc,
    dni: initialValues?.dni ?? defaultFormState.dni,
    observaciones: initialValues?.observaciones ?? defaultFormState.observaciones,
    estado: initialValues?.estado ?? defaultFormState.estado,
  };
}

function buildPayload(formState: FormState): CreateTenantPayload {
  const payload: CreateTenantPayload = {
    nombre: formState.nombre.trim(),
    estado: formState.estado,
  };

  const ruc = formState.ruc.trim();
  const dni = formState.dni.trim();
  const observaciones = formState.observaciones.trim();

  if (ruc) {
    payload.ruc = ruc;
  }

  if (dni) {
    payload.dni = dni;
  }

  if (observaciones) {
    payload.observaciones = observaciones;
  }

  return payload;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    return error.message;
  }

  return 'No se pudo guardar la junta. Inténtalo nuevamente.';
}

export function TenantFormDialog({
  open,
  mode = 'create',
  initialValues,
  onClose,
  onCreated,
  onUpdated,
  onShowMessage,
}: TenantFormDialogProps) {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(mode === 'edit' ? mapInitialValues(initialValues) : defaultFormState);
    setSubmitting(false);
    setTouched(false);
  }, [initialValues, mode, open]);

  const hasNameError = touched && !formState.nombre.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!formState.nombre.trim() || submitting) {
      return;
    }

    if (mode === 'edit') {
      if (initialValues?.idTenant === undefined || initialValues.idTenant === null) {
        onShowMessage('No se pudo identificar la junta a editar.', 'error');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'edit') {
        const updatedTenant = await updateTenant(initialValues!.idTenant!, buildPayload(formState));
        onShowMessage('Junta actualizada correctamente', 'success');
        onUpdated(updatedTenant);
      } else {
        const createdTenant = await createTenant(buildPayload(formState));
        onShowMessage('Junta creada correctamente', 'success');
        onCreated(createdTenant);
      }

      onClose();
    } catch (error) {
      onShowMessage(getErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
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
              label="RUC"
              onChange={(event) =>
                setFormState((current) => ({ ...current, ruc: event.target.value }))
              }
              value={formState.ruc}
            />
            <TextField
              fullWidth
              label="DNI"
              onChange={(event) =>
                setFormState((current) => ({ ...current, dni: event.target.value }))
              }
              value={formState.dni}
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
            disabled={submitting || !formState.nombre.trim()}
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
