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
import type { ConceptoCobro, ConceptoCobroCreateDto, ConceptoCobroTipo } from '../types';
import { CONCEPTO_COBRO_TIPO_LABELS } from './conceptosCobroUi';

type FormMode = 'create' | 'edit';

type ConceptoCobroFormState = {
  nombre: string;
  tipo: ConceptoCobroTipo;
  activo: boolean;
  requierePeriodo: boolean;
  observaciones: string;
};

type ConceptoCobroFormErrors = Partial<Record<keyof ConceptoCobroFormState, string>>;

type ConceptoCobroFormDialogProps = {
  open: boolean;
  mode: FormMode;
  concepto?: ConceptoCobro | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: ConceptoCobroCreateDto) => Promise<void>;
};

const conceptoTipos: ConceptoCobroTipo[] = [
  'CUOTA_ORDINARIA',
  'CUOTA_EXTRAORDINARIA',
  'MULTA_FAENA',
  'MULTA_ASAMBLEA',
  'APORTE',
  'OTRO',
];

const defaultFormState: ConceptoCobroFormState = {
  nombre: '',
  tipo: 'CUOTA_ORDINARIA',
  activo: true,
  requierePeriodo: false,
  observaciones: '',
};

function mapConceptoToFormState(concepto: ConceptoCobro): ConceptoCobroFormState {
  return {
    nombre: concepto.nombre,
    tipo: concepto.tipo,
    activo: concepto.activo,
    requierePeriodo: concepto.requierePeriodo,
    observaciones: concepto.observaciones ?? '',
  };
}

function mapFormToPayload(formState: ConceptoCobroFormState): ConceptoCobroCreateDto {
  return {
    nombre: formState.nombre.trim(),
    tipo: formState.tipo,
    activo: formState.activo,
    requierePeriodo: formState.requierePeriodo,
    observaciones: formState.observaciones.trim() || null,
  };
}

function validateForm(formState: ConceptoCobroFormState): ConceptoCobroFormErrors {
  const errors: ConceptoCobroFormErrors = {};

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

export function ConceptoCobroFormDialog({
  open,
  mode,
  concepto,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: ConceptoCobroFormDialogProps) {
  const [formState, setFormState] = useState<ConceptoCobroFormState>(defaultFormState);
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

    if (concepto) {
      setFormState(mapConceptoToFormState(concepto));
    }
  }, [concepto, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof ConceptoCobroFormState>(key: K) =>
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
      <DialogTitle>{mode === 'edit' ? 'Editar concepto de cobro' : 'Nuevo concepto de cobro'}</DialogTitle>
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
                {conceptoTipos.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {CONCEPTO_COBRO_TIPO_LABELS[tipo]}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.requierePeriodo}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          requierePeriodo: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="Requiere periodo"
                />
              </Stack>
              <TextField
                fullWidth
                label="Observaciones"
                minRows={3}
                multiline
                onChange={handleChange('observaciones')}
                value={formState.observaciones}
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
