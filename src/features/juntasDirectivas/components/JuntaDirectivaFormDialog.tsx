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
import {
  createJuntaDirectiva,
  getJuntaDirectivaById,
  updateJuntaDirectiva,
} from '../services/juntasDirectivasApi';
import type {
  JuntaDirectiva,
  JuntaDirectivaCreateDto,
  JuntaDirectivaEstado,
} from '../types';
import { getJuntasDirectivasErrorMessage } from './juntasDirectivasUi';

type ToastSeverity = 'success' | 'error' | 'info' | 'warning';
type FormMode = 'create' | 'edit';

type JuntaDirectivaFormState = {
  nombre: string;
  fechaEleccion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: JuntaDirectivaEstado;
  documentoSustento: string;
  observaciones: string;
};

type JuntaDirectivaFormErrors = Partial<Record<keyof JuntaDirectivaFormState, string>>;

type JuntaDirectivaFormDialogProps = {
  open: boolean;
  mode: FormMode;
  tenantId: string;
  juntaId?: string | number | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onShowMessage: (message: string, severity: ToastSeverity) => void;
};

const defaultFormState: JuntaDirectivaFormState = {
  nombre: '',
  fechaEleccion: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'PROYECTADA',
  documentoSustento: '',
  observaciones: '',
};

function mapJuntaToFormState(junta: JuntaDirectiva): JuntaDirectivaFormState {
  return {
    nombre: junta.nombre,
    fechaEleccion: junta.fechaEleccion ? junta.fechaEleccion.slice(0, 10) : '',
    fechaInicio: junta.fechaInicio ? junta.fechaInicio.slice(0, 10) : '',
    fechaFin: junta.fechaFin ? junta.fechaFin.slice(0, 10) : '',
    estado: junta.estado,
    documentoSustento: junta.documentoSustento ?? '',
    observaciones: junta.observaciones ?? '',
  };
}

function mapFormToPayload(formState: JuntaDirectivaFormState): JuntaDirectivaCreateDto {
  return {
    nombre: formState.nombre.trim(),
    fechaEleccion: formState.fechaEleccion,
    fechaInicio: formState.fechaInicio,
    fechaFin: formState.fechaFin,
    estado: formState.estado,
    documentoSustento: formState.documentoSustento.trim() || undefined,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: JuntaDirectivaFormState): JuntaDirectivaFormErrors {
  const errors: JuntaDirectivaFormErrors = {};

  if (!formState.nombre.trim()) {
    errors.nombre = 'El nombre es requerido.';
  }

  if (!formState.fechaEleccion) {
    errors.fechaEleccion = 'La fecha de elección es requerida.';
  }

  if (!formState.fechaInicio) {
    errors.fechaInicio = 'La fecha de inicio es requerida.';
  }

  if (!formState.fechaFin) {
    errors.fechaFin = 'La fecha de fin es requerida.';
  }

  return errors;
}

export function JuntaDirectivaFormDialog({
  open,
  mode,
  tenantId,
  juntaId,
  onClose,
  onSaved,
  onShowMessage,
}: JuntaDirectivaFormDialogProps) {
  const [formState, setFormState] = useState<JuntaDirectivaFormState>(defaultFormState);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);
    setLoadError(null);
    setSubmitting(false);

    if (mode === 'create') {
      setFormState(defaultFormState);
      setLoading(false);
      return;
    }

    if (!juntaId) {
      setLoadError('No se pudo identificar la junta directiva a editar.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadJunta = async () => {
      setLoading(true);

      try {
        const junta = await getJuntaDirectivaById(tenantId, juntaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormState(mapJuntaToFormState(junta));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            getJuntasDirectivasErrorMessage(error, 'No se pudo cargar la junta directiva.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJunta();

    return () => {
      controller.abort();
    };
  }, [mode, open, juntaId, tenantId]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof JuntaDirectivaFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (Object.keys(validateForm(formState)).length > 0 || loading || submitting) {
      return;
    }

    if (mode === 'edit' && !juntaId) {
      onShowMessage('No se pudo identificar la junta directiva a editar.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit') {
        await updateJuntaDirectiva(tenantId, juntaId!, mapFormToPayload(formState));
        onSaved('Junta directiva actualizada correctamente');
      } else {
        await createJuntaDirectiva(tenantId, mapFormToPayload(formState));
        onSaved('Junta directiva creada correctamente');
      }
    } catch (error) {
      onShowMessage(
        getJuntasDirectivasErrorMessage(error, 'No se pudo guardar la junta directiva.'),
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar junta directiva' : 'Nueva junta directiva'}</DialogTitle>
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
                error={Boolean(errors.fechaEleccion)}
                fullWidth
                helperText={errors.fechaEleccion ?? ' '}
                label="Fecha de elección"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fechaEleccion')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaEleccion}
              />
              <TextField
                error={Boolean(errors.fechaInicio)}
                fullWidth
                helperText={errors.fechaInicio ?? ' '}
                label="Fecha de inicio"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fechaInicio')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaInicio}
              />
              <TextField
                error={Boolean(errors.fechaFin)}
                fullWidth
                helperText={errors.fechaFin ?? ' '}
                label="Fecha de fin"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fechaFin')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaFin}
              />
              <TextField
                fullWidth
                label="Estado"
                onChange={handleChange('estado')}
                select
                value={formState.estado}
              >
                <MenuItem value="VIGENTE">VIGENTE</MenuItem>
                <MenuItem value="CESADA">CESADA</MenuItem>
                <MenuItem value="ANULADA">ANULADA</MenuItem>
                <MenuItem value="PROYECTADA">PROYECTADA</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Documento sustento"
                onChange={handleChange('documentoSustento')}
                value={formState.documentoSustento}
              />
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
