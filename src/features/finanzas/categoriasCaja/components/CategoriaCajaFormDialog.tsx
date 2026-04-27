import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { CajaCategoria, CajaCategoriaCreateDto, CajaCategoriaTipo } from '../types';

type FormMode = 'create' | 'edit';

type CategoriaCajaFormState = {
  nombre: string;
  tipo: CajaCategoriaTipo;
  activo: boolean;
};

type CategoriaCajaFormErrors = Partial<Record<keyof CategoriaCajaFormState, string>>;

type CategoriaCajaFormDialogProps = {
  open: boolean;
  mode: FormMode;
  categoria?: CajaCategoria | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CajaCategoriaCreateDto) => Promise<void>;
};

const defaultFormState: CategoriaCajaFormState = {
  nombre: '',
  tipo: 'INGRESO',
  activo: true,
};

function mapCategoriaToFormState(categoria: CajaCategoria): CategoriaCajaFormState {
  return {
    nombre: categoria.nombre,
    tipo: categoria.tipo,
    activo: categoria.activo,
  };
}

function mapFormToPayload(formState: CategoriaCajaFormState): CajaCategoriaCreateDto {
  return {
    nombre: formState.nombre.trim(),
    tipo: formState.tipo,
    activo: formState.activo,
  };
}

function validateForm(formState: CategoriaCajaFormState): CategoriaCajaFormErrors {
  const errors: CategoriaCajaFormErrors = {};

  if (!formState.nombre.trim()) {
    errors.nombre = 'El nombre es requerido.';
  } else if (formState.nombre.trim().length > 100) {
    errors.nombre = 'El nombre no debe superar 100 caracteres.';
  }

  if (!formState.tipo) {
    errors.tipo = 'El tipo es requerido.';
  }

  return errors;
}

export function CategoriaCajaFormDialog({
  open,
  mode,
  categoria,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: CategoriaCajaFormDialogProps) {
  const [formState, setFormState] = useState<CategoriaCajaFormState>(defaultFormState);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);

    if (mode === 'create') {
      setFormState(defaultFormState);
      return;
    }

    if (categoria) {
      setFormState(mapCategoriaToFormState(categoria));
    }
  }, [categoria, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof CategoriaCajaFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (Object.keys(validateForm(formState)).length > 0 || loading || submitting) {
      return;
    }

    await onSubmit(mapFormToPayload(formState));
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar categoría de caja' : 'Nueva categoría de caja'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {loadError && <Alert severity="error">{loadError}</Alert>}
              <TextField
                autoFocus
                error={Boolean(errors.nombre)}
                fullWidth
                helperText={errors.nombre ?? ' '}
                label="Nombre"
                onBlur={() => setTouched(true)}
                onChange={handleChange('nombre')}
                required
                value={formState.nombre}
              />
              <TextField
                error={Boolean(errors.tipo)}
                fullWidth
                helperText={errors.tipo ?? ' '}
                label="Tipo"
                onBlur={() => setTouched(true)}
                onChange={handleChange('tipo')}
                required
                select
                value={formState.tipo}
              >
                <MenuItem value="INGRESO">INGRESO</MenuItem>
                <MenuItem value="GASTO">GASTO</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.activo}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, activo: event.target.checked }))
                    }
                  />
                }
                label="Activo"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={submitting} onClick={onClose} variant="text">
            Cancelar
          </Button>
          <Button
            disabled={loading || submitting || Boolean(loadError) || hasErrors}
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
