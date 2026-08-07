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
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Bien, BienCreateDto, BienEstado } from '../types';

type FormMode = 'create' | 'edit';

type BienFormState = {
  descripcion: string;
  tipo: string;
  cantidad: string;
  valorEstimado: string;
  ubicacion: string;
  fechaAlta: string;
  fechaBaja: string;
  estado: BienEstado;
  observaciones: string;
};

type BienFormErrors = Partial<Record<keyof BienFormState, string>>;

type BienFormDialogProps = {
  open: boolean;
  mode: FormMode;
  bien?: Bien | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: BienCreateDto) => Promise<void>;
};

const defaultFormState: BienFormState = {
  descripcion: '',
  tipo: '',
  cantidad: '',
  valorEstimado: '',
  ubicacion: '',
  fechaAlta: '',
  fechaBaja: '',
  estado: 'BUENO',
  observaciones: '',
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function mapBienToFormState(bien: Bien): BienFormState {
  return {
    descripcion: bien.descripcion,
    tipo: bien.tipo ?? '',
    cantidad: String(bien.cantidad),
    valorEstimado: bien.valorEstimado === null ? '' : String(bien.valorEstimado),
    ubicacion: bien.ubicacion ?? '',
    fechaAlta: bien.fechaAlta ? bien.fechaAlta.slice(0, 10) : '',
    fechaBaja: bien.fechaBaja ? bien.fechaBaja.slice(0, 10) : '',
    estado: bien.estado,
    observaciones: bien.observaciones ?? '',
  };
}

function mapFormToPayload(formState: BienFormState): BienCreateDto {
  return {
    descripcion: formState.descripcion.trim(),
    tipo: formState.tipo.trim() || null,
    cantidad: Number(formState.cantidad),
    valorEstimado: formState.valorEstimado.trim() ? Number(formState.valorEstimado) : null,
    ubicacion: formState.ubicacion.trim() || null,
    fechaAlta: formState.fechaAlta,
    fechaBaja: formState.fechaBaja || null,
    estado: formState.estado,
    observaciones: formState.observaciones.trim() || null,
  };
}

function validateForm(formState: BienFormState): BienFormErrors {
  const errors: BienFormErrors = {};
  const cantidad = Number(formState.cantidad);
  const valorEstimado = Number(formState.valorEstimado);

  if (!formState.descripcion.trim()) {
    errors.descripcion = 'La descripcion es requerida.';
  }

  if (!formState.tipo.trim()) {
    errors.tipo = 'El tipo es requerido.';
  }

  if (!formState.cantidad.trim()) {
    errors.cantidad = 'La cantidad es requerida.';
  } else if (!Number.isFinite(cantidad) || cantidad < 0) {
    errors.cantidad = 'Ingresa una cantidad valida.';
  }

  if (!formState.valorEstimado.trim()) {
    errors.valorEstimado = 'El valor estimado es requerido.';
  } else if (!Number.isFinite(valorEstimado) || valorEstimado < 0) {
    errors.valorEstimado = 'Ingresa un valor estimado valido.';
  }

  if (!formState.ubicacion.trim()) {
    errors.ubicacion = 'La ubicacion es requerida.';
  }

  if (!formState.fechaAlta) {
    errors.fechaAlta = 'La fecha de alta es requerida.';
  }

  return errors;
}

export function BienFormDialog({
  open,
  mode,
  bien,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: BienFormDialogProps) {
  const [formState, setFormState] = useState<BienFormState>(defaultFormState);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);

    if (mode === 'create') {
      setFormState({ ...defaultFormState, fechaAlta: getTodayDateString() });
      return;
    }

    if (bien) {
      setFormState(mapBienToFormState(bien));
    }
  }, [bien, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof BienFormState>(key: K) =>
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
      <DialogTitle>{mode === 'edit' ? 'Editar bien' : 'Nuevo bien'}</DialogTitle>
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
                error={Boolean(errors.descripcion)}
                fullWidth
                helperText={errors.descripcion ?? ' '}
                label="Descripción"
                onBlur={() => setTouched(true)}
                onChange={handleChange('descripcion')}
                required
                value={formState.descripcion}
              />
              <TextField
                error={Boolean(errors.tipo)}
                fullWidth
                helperText={errors.tipo ?? ' '}
                label="Tipo"
                onBlur={() => setTouched(true)}
                onChange={handleChange('tipo')}
                required
                value={formState.tipo}
              />
              <TextField
                error={Boolean(errors.cantidad)}
                fullWidth
                helperText={errors.cantidad ?? ' '}
                label="Cantidad"
                onBlur={() => setTouched(true)}
                onChange={handleChange('cantidad')}
                required
                type="number"
                value={formState.cantidad}
              />
              <TextField
                error={Boolean(errors.valorEstimado)}
                fullWidth
                helperText={errors.valorEstimado ?? ' '}
                label="Valor estimado"
                onBlur={() => setTouched(true)}
                onChange={handleChange('valorEstimado')}
                required
                type="number"
                value={formState.valorEstimado}
              />
              <TextField
                error={Boolean(errors.ubicacion)}
                fullWidth
                helperText={errors.ubicacion ?? ' '}
                label="Ubicación"
                onBlur={() => setTouched(true)}
                onChange={handleChange('ubicacion')}
                required
                value={formState.ubicacion}
              />
              <TextField
                error={Boolean(errors.fechaAlta)}
                fullWidth
                helperText={errors.fechaAlta ?? ' '}
                label="Fecha de alta"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fechaAlta')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaAlta}
              />
              {mode === 'edit' && (
                <TextField
                  fullWidth
                  label="Fecha de baja"
                  onChange={handleChange('fechaBaja')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={formState.fechaBaja}
                />
              )}
              <TextField
                fullWidth
                label="Estado"
                onChange={handleChange('estado')}
                select
                value={formState.estado}
              >
                <MenuItem value="BUENO">BUENO</MenuItem>
                <MenuItem value="REGULAR">REGULAR</MenuItem>
                <MenuItem value="MALO">MALO</MenuItem>
                <MenuItem value="DADO_DE_BAJA">DADO_DE_BAJA</MenuItem>
              </TextField>
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

