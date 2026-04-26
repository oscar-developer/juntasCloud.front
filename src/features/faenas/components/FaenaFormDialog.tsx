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
import type { Faena, FaenaCreateDto, FaenaEstado, FaenaTipo } from '../types';
import {
  formatFaenaDateInput,
  formatFaenaTimeInput,
} from './faenasUi';

type FormMode = 'create' | 'edit';

type FaenaFormState = {
  fechaProgramada: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  lugar: string;
  tipoFaena: FaenaTipo;
  esObligatoria: boolean;
  estado: FaenaEstado;
  montoMultaBase: string;
  observaciones: string;
};

type FaenaFormErrors = Partial<Record<keyof FaenaFormState, string>>;

type FaenaFormDialogProps = {
  open: boolean;
  mode: FormMode;
  faena?: Faena | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: FaenaCreateDto) => Promise<void>;
};

const defaultFormState: FaenaFormState = {
  fechaProgramada: '',
  horaInicio: '',
  horaFin: '',
  descripcion: '',
  lugar: '',
  tipoFaena: 'ORDINARIA',
  esObligatoria: true,
  estado: 'PROGRAMADA',
  montoMultaBase: '',
  observaciones: '',
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapFaenaToFormState(faena: Faena): FaenaFormState {
  return {
    fechaProgramada: formatFaenaDateInput(faena.fechaProgramada),
    horaInicio: formatFaenaTimeInput(faena.horaInicio),
    horaFin: formatFaenaTimeInput(faena.horaFin),
    descripcion: faena.descripcion,
    lugar: faena.lugar ?? '',
    tipoFaena: faena.tipoFaena,
    esObligatoria: faena.esObligatoria,
    estado: faena.estado,
    montoMultaBase:
      faena.montoMultaBase === null || faena.montoMultaBase === undefined
        ? ''
        : String(faena.montoMultaBase),
    observaciones: faena.observaciones ?? '',
  };
}

function mapFormToPayload(formState: FaenaFormState): FaenaCreateDto {
  return {
    fechaProgramada: formState.fechaProgramada,
    horaInicio: formState.horaInicio || undefined,
    horaFin: formState.horaFin || undefined,
    descripcion: formState.descripcion.trim(),
    lugar: formState.lugar.trim() || undefined,
    tipoFaena: formState.tipoFaena,
    esObligatoria: formState.esObligatoria,
    estado: formState.estado,
    montoMultaBase: formState.montoMultaBase.trim() ? Number(formState.montoMultaBase) : undefined,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: FaenaFormState): FaenaFormErrors {
  const errors: FaenaFormErrors = {};
  const multaValue = Number(formState.montoMultaBase);

  if (!formState.fechaProgramada) {
    errors.fechaProgramada = 'La fecha programada es requerida.';
  }

  if (!formState.descripcion.trim()) {
    errors.descripcion = 'La descripción es requerida.';
  }

  if (formState.montoMultaBase.trim() && (!Number.isFinite(multaValue) || multaValue < 0)) {
    errors.montoMultaBase = 'Ingresa una multa base válida.';
  }

  if (formState.horaInicio && formState.horaFin && formState.horaInicio > formState.horaFin) {
    errors.horaFin = 'La hora fin debe ser mayor o igual a la hora inicio.';
  }

  return errors;
}

export function FaenaFormDialog({
  open,
  mode,
  faena,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: FaenaFormDialogProps) {
  const [formState, setFormState] = useState<FaenaFormState>(defaultFormState);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);

    if (mode === 'create') {
      setFormState({ ...defaultFormState, fechaProgramada: getTodayDateString() });
      return;
    }

    if (faena) {
      setFormState(mapFaenaToFormState(faena));
    }
  }, [faena, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleFieldChange =
    (key: Exclude<keyof FaenaFormState, 'esObligatoria'>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };

  const handleRequiredSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({
      ...current,
      esObligatoria: event.target.checked,
    }));
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
      <DialogTitle>{mode === 'edit' ? 'Editar faena' : 'Nueva faena'}</DialogTitle>
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
                error={Boolean(errors.fechaProgramada)}
                fullWidth
                helperText={errors.fechaProgramada ?? ' '}
                label="Fecha programada"
                onBlur={() => setTouched(true)}
                onChange={handleFieldChange('fechaProgramada')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaProgramada}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Hora inicio"
                  onChange={handleFieldChange('horaInicio')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="time"
                  value={formState.horaInicio}
                />
                <TextField
                  error={Boolean(errors.horaFin)}
                  fullWidth
                  helperText={errors.horaFin ?? ' '}
                  label="Hora fin"
                  onBlur={() => setTouched(true)}
                  onChange={handleFieldChange('horaFin')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="time"
                  value={formState.horaFin}
                />
              </Stack>
              <TextField
                autoFocus
                error={Boolean(errors.descripcion)}
                fullWidth
                helperText={errors.descripcion ?? ' '}
                label="Descripción"
                onBlur={() => setTouched(true)}
                onChange={handleFieldChange('descripcion')}
                required
                value={formState.descripcion}
              />
              <TextField fullWidth label="Lugar" onChange={handleFieldChange('lugar')} value={formState.lugar} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Tipo" onChange={handleFieldChange('tipoFaena')} select value={formState.tipoFaena}>
                  <MenuItem value="ORDINARIA">ORDINARIA</MenuItem>
                  <MenuItem value="EXTRAORDINARIA">EXTRAORDINARIA</MenuItem>
                  <MenuItem value="RECUPERACION">RECUPERACION</MenuItem>
                </TextField>
                <TextField fullWidth label="Estado" onChange={handleFieldChange('estado')} select value={formState.estado}>
                  <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
                  <MenuItem value="EJECUTADA">EJECUTADA</MenuItem>
                  <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                </TextField>
              </Stack>
              <FormControlLabel
                control={<Switch checked={formState.esObligatoria} onChange={handleRequiredSwitchChange} />}
                label="Faena obligatoria"
              />
              <TextField
                error={Boolean(errors.montoMultaBase)}
                fullWidth
                helperText={errors.montoMultaBase ?? ' '}
                label="Multa base"
                onBlur={() => setTouched(true)}
                onChange={handleFieldChange('montoMultaBase')}
                type="number"
                value={formState.montoMultaBase}
              />
              <TextField
                fullWidth
                label="Observaciones"
                minRows={3}
                multiline
                onChange={handleFieldChange('observaciones')}
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
