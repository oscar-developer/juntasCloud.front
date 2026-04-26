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
import type { Asamblea, AsambleaConvocatoria, AsambleaCreateDto, AsambleaEstado, AsambleaTipo } from '../types';
import {
  formatAsambleaDateInput,
  formatAsambleaTimeInput,
} from './asambleasUi';

type FormMode = 'create' | 'edit';

type AsambleaFormState = {
  fechaProgramada: string;
  horaInicioReal: string;
  horaFinReal: string;
  tipo: AsambleaTipo;
  convocatoria: AsambleaConvocatoria | '';
  estado: AsambleaEstado;
  temaPrincipal: string;
  lugar: string;
  quorumRequerido: string;
  quorumAlcanzado: string;
  numeroActa: string;
  observaciones: string;
};

type AsambleaFormErrors = Partial<Record<keyof AsambleaFormState, string>>;

type AsambleaFormDialogProps = {
  open: boolean;
  mode: FormMode;
  asamblea?: Asamblea | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: AsambleaCreateDto) => Promise<void>;
};

const defaultFormState: AsambleaFormState = {
  fechaProgramada: '',
  horaInicioReal: '',
  horaFinReal: '',
  tipo: 'ORDINARIA',
  convocatoria: '',
  estado: 'PROGRAMADA',
  temaPrincipal: '',
  lugar: '',
  quorumRequerido: '',
  quorumAlcanzado: '',
  numeroActa: '',
  observaciones: '',
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapAsambleaToFormState(asamblea: Asamblea): AsambleaFormState {
  return {
    fechaProgramada: formatAsambleaDateInput(asamblea.fechaProgramada),
    horaInicioReal: formatAsambleaTimeInput(asamblea.horaInicioReal),
    horaFinReal: formatAsambleaTimeInput(asamblea.horaFinReal),
    tipo: asamblea.tipo,
    convocatoria: asamblea.convocatoria ?? '',
    estado: asamblea.estado,
    temaPrincipal: asamblea.temaPrincipal,
    lugar: asamblea.lugar ?? '',
    quorumRequerido:
      asamblea.quorumRequerido === null || asamblea.quorumRequerido === undefined
        ? ''
        : String(asamblea.quorumRequerido),
    quorumAlcanzado:
      asamblea.quorumAlcanzado === null || asamblea.quorumAlcanzado === undefined
        ? ''
        : String(asamblea.quorumAlcanzado),
    numeroActa: asamblea.numeroActa ?? '',
    observaciones: asamblea.observaciones ?? '',
  };
}

function mapFormToPayload(formState: AsambleaFormState): AsambleaCreateDto {
  return {
    fechaProgramada: formState.fechaProgramada,
    horaInicioReal: formState.horaInicioReal || undefined,
    horaFinReal: formState.horaFinReal || undefined,
    tipo: formState.tipo,
    convocatoria: formState.convocatoria || undefined,
    estado: formState.estado,
    temaPrincipal: formState.temaPrincipal.trim(),
    lugar: formState.lugar.trim() || undefined,
    quorumRequerido: formState.quorumRequerido.trim() ? Number(formState.quorumRequerido) : undefined,
    quorumAlcanzado: formState.quorumAlcanzado.trim() ? Number(formState.quorumAlcanzado) : undefined,
    numeroActa: formState.numeroActa.trim() || undefined,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: AsambleaFormState): AsambleaFormErrors {
  const errors: AsambleaFormErrors = {};
  const quorumRequerido = Number(formState.quorumRequerido);
  const quorumAlcanzado = Number(formState.quorumAlcanzado);

  if (!formState.fechaProgramada) {
    errors.fechaProgramada = 'La fecha programada es requerida.';
  }

  if (!formState.temaPrincipal.trim()) {
    errors.temaPrincipal = 'El tema principal es requerido.';
  }

  if (formState.horaInicioReal && formState.horaFinReal && formState.horaInicioReal > formState.horaFinReal) {
    errors.horaFinReal = 'La hora fin debe ser mayor o igual a la hora inicio.';
  }

  if (formState.quorumRequerido.trim() && (!Number.isFinite(quorumRequerido) || quorumRequerido < 0)) {
    errors.quorumRequerido = 'Ingresa un quórum requerido válido.';
  }

  if (formState.quorumAlcanzado.trim() && (!Number.isFinite(quorumAlcanzado) || quorumAlcanzado < 0)) {
    errors.quorumAlcanzado = 'Ingresa un quórum alcanzado válido.';
  }

  return errors;
}

export function AsambleaFormDialog({
  open,
  mode,
  asamblea,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
}: AsambleaFormDialogProps) {
  const [formState, setFormState] = useState<AsambleaFormState>(defaultFormState);
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

    if (asamblea) {
      setFormState(mapAsambleaToFormState(asamblea));
    }
  }, [asamblea, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof AsambleaFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [key]: event.target.value,
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
      <DialogTitle>{mode === 'edit' ? 'Editar asamblea' : 'Nueva asamblea'}</DialogTitle>
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
                onChange={handleChange('fechaProgramada')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaProgramada}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Hora inicio real"
                  onChange={handleChange('horaInicioReal')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="time"
                  value={formState.horaInicioReal}
                />
                <TextField
                  error={Boolean(errors.horaFinReal)}
                  fullWidth
                  helperText={errors.horaFinReal ?? ' '}
                  label="Hora fin real"
                  onBlur={() => setTouched(true)}
                  onChange={handleChange('horaFinReal')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="time"
                  value={formState.horaFinReal}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Tipo" onChange={handleChange('tipo')} select value={formState.tipo}>
                  <MenuItem value="ORDINARIA">ORDINARIA</MenuItem>
                  <MenuItem value="EXTRAORDINARIA">EXTRAORDINARIA</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Convocatoria"
                  onChange={handleChange('convocatoria')}
                  select
                  value={formState.convocatoria}
                >
                  <MenuItem value="">Sin convocatoria</MenuItem>
                  <MenuItem value="PRIMERA">PRIMERA</MenuItem>
                  <MenuItem value="SEGUNDA">SEGUNDA</MenuItem>
                </TextField>
              </Stack>
              <TextField fullWidth label="Estado" onChange={handleChange('estado')} select value={formState.estado}>
                <MenuItem value="PROGRAMADA">PROGRAMADA</MenuItem>
                <MenuItem value="REALIZADA">REALIZADA</MenuItem>
                <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                <MenuItem value="CERRADA">CERRADA</MenuItem>
              </TextField>
              <TextField
                autoFocus
                error={Boolean(errors.temaPrincipal)}
                fullWidth
                helperText={errors.temaPrincipal ?? ' '}
                label="Tema principal"
                onBlur={() => setTouched(true)}
                onChange={handleChange('temaPrincipal')}
                required
                value={formState.temaPrincipal}
              />
              <TextField fullWidth label="Lugar" onChange={handleChange('lugar')} value={formState.lugar} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  error={Boolean(errors.quorumRequerido)}
                  fullWidth
                  helperText={errors.quorumRequerido ?? ' '}
                  label="Quórum requerido"
                  onBlur={() => setTouched(true)}
                  onChange={handleChange('quorumRequerido')}
                  type="number"
                  value={formState.quorumRequerido}
                />
                <TextField
                  error={Boolean(errors.quorumAlcanzado)}
                  fullWidth
                  helperText={errors.quorumAlcanzado ?? ' '}
                  label="Quórum alcanzado"
                  onBlur={() => setTouched(true)}
                  onChange={handleChange('quorumAlcanzado')}
                  type="number"
                  value={formState.quorumAlcanzado}
                />
              </Stack>
              <TextField fullWidth label="Número de acta" onChange={handleChange('numeroActa')} value={formState.numeroActa} />
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
          <Button disabled={loading || submitting || Boolean(loadError) || hasErrors} type="submit" variant="contained">
            {submitting ? <CircularProgress color="inherit" size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
