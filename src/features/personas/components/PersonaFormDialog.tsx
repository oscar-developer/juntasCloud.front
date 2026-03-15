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
import { createPersona, getPersonaById, updatePersona } from '../services/personasApi';
import type { Persona, PersonaCreateDto, PersonaEstado, PersonaTipoParticipante } from '../types';
import { getPersonaErrorMessage } from './personaUi';

type ToastSeverity = 'success' | 'error' | 'info' | 'warning';
type FormMode = 'create' | 'edit';

type PersonaFormState = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  referenciaVivienda: string;
  tipoParticipante: PersonaTipoParticipante;
  estado: PersonaEstado;
  fechaRegistro: string;
  fechaBaja: string;
  observaciones: string;
};

type PersonaFormErrors = Partial<Record<keyof PersonaFormState, string>>;

type PersonaFormDialogProps = {
  open: boolean;
  mode: FormMode;
  tenantId: string;
  personaId?: string | number | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onShowMessage: (message: string, severity: ToastSeverity) => void;
};

const defaultFormState: PersonaFormState = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  referenciaVivienda: '',
  tipoParticipante: 'PADRONADO',
  estado: 'ACTIVO',
  fechaRegistro: '',
  fechaBaja: '',
  observaciones: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapPersonaToFormState(persona: Persona): PersonaFormState {
  return {
    nombres: persona.nombres,
    apellidoPaterno: persona.apellidoPaterno,
    apellidoMaterno: persona.apellidoMaterno,
    dni: persona.dni ?? '',
    email: persona.email ?? '',
    telefono: persona.telefono ?? '',
    direccion: persona.direccion ?? '',
    referenciaVivienda: persona.referenciaVivienda ?? '',
    tipoParticipante: persona.tipoParticipante,
    estado: persona.estado,
    fechaRegistro: persona.fechaRegistro ? persona.fechaRegistro.slice(0, 10) : '',
    fechaBaja: persona.fechaBaja ? persona.fechaBaja.slice(0, 10) : '',
    observaciones: persona.observaciones ?? '',
  };
}

function mapFormToPayload(formState: PersonaFormState): PersonaCreateDto {
  return {
    nombres: formState.nombres.trim(),
    apellidoPaterno: formState.apellidoPaterno.trim(),
    apellidoMaterno: formState.apellidoMaterno.trim(),
    dni: formState.dni.trim() || undefined,
    email: formState.email.trim() || undefined,
    telefono: formState.telefono.trim() || undefined,
    direccion: formState.direccion.trim() || undefined,
    referenciaVivienda: formState.referenciaVivienda.trim() || undefined,
    tipoParticipante: formState.tipoParticipante,
    estado: formState.estado,
    fechaRegistro: formState.fechaRegistro,
    fechaBaja: formState.fechaBaja || undefined,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: PersonaFormState): PersonaFormErrors {
  const errors: PersonaFormErrors = {};

  if (!formState.nombres.trim()) {
    errors.nombres = 'Los nombres son requeridos.';
  }

  if (!formState.apellidoPaterno.trim()) {
    errors.apellidoPaterno = 'El apellido paterno es requerido.';
  }

  if (!formState.apellidoMaterno.trim()) {
    errors.apellidoMaterno = 'El apellido materno es requerido.';
  }

  if (!formState.fechaRegistro) {
    errors.fechaRegistro = 'La fecha de registro es requerida.';
  }

  if (formState.dni.trim().length > 15) {
    errors.dni = 'El DNI no puede superar 15 caracteres.';
  }

  if (formState.email.trim() && !emailPattern.test(formState.email.trim())) {
    errors.email = 'Ingresa un email valido.';
  }

  if (formState.telefono.trim().length > 20) {
    errors.telefono = 'El teléfono no puede superar 20 caracteres.';
  }

  return errors;
}
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function PersonaFormDialog({
  open,
  mode,
  tenantId,
  personaId,
  onClose,
  onSaved,
  onShowMessage,
}: PersonaFormDialogProps) {
  const [formState, setFormState] = useState<PersonaFormState>(defaultFormState);
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
      setFormState({ ...defaultFormState, fechaRegistro: getTodayDateString() });
      // setFormState(defaultFormState);
      setLoading(false);
      return;
    }

    if (!personaId) {
      setLoadError('No se pudo identificar la persona a editar.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadPersona = async () => {
      setLoading(true);

      try {
        const persona = await getPersonaById(tenantId, personaId, controller.signal);

        if (!controller.signal.aborted) {
          setFormState(mapPersonaToFormState(persona));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(getPersonaErrorMessage(error, 'No se pudo cargar la persona.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPersona();

    return () => {
      controller.abort();
    };
  }, [mode, open, personaId, tenantId]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof PersonaFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (Object.keys(validateForm(formState)).length > 0 || loading || submitting) {
      return;
    }

    if (mode === 'edit' && !personaId) {
      onShowMessage('No se pudo identificar la persona a editar.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit') {
        await updatePersona(tenantId, personaId!, mapFormToPayload(formState));
        onSaved('Persona actualizada correctamente');
      } else {
        await createPersona(tenantId, mapFormToPayload(formState));
        onSaved('Persona creada correctamente');
      }
    } catch (error) {
      onShowMessage(getPersonaErrorMessage(error, 'No se pudo guardar la persona.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
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
                error={Boolean(errors.nombres)}
                fullWidth
                helperText={errors.nombres ?? ' '}
                label="Nombres"
                onBlur={() => setTouched(true)}
                onChange={handleChange('nombres')}
                required
                value={formState.nombres}
              />
              <TextField
                error={Boolean(errors.apellidoPaterno)}
                fullWidth
                helperText={errors.apellidoPaterno ?? ' '}
                label="Apellido paterno"
                onBlur={() => setTouched(true)}
                onChange={handleChange('apellidoPaterno')}
                required
                value={formState.apellidoPaterno}
              />
              <TextField
                error={Boolean(errors.apellidoMaterno)}
                fullWidth
                helperText={errors.apellidoMaterno ?? ' '}
                label="Apellido materno"
                onBlur={() => setTouched(true)}
                onChange={handleChange('apellidoMaterno')}
                required
                value={formState.apellidoMaterno}
              />
              <TextField
                error={Boolean(errors.dni)}
                fullWidth
                helperText={errors.dni ?? ' '}
                inputProps={{ maxLength: 15 }}
                label="DNI"
                onBlur={() => setTouched(true)}
                onChange={handleChange('dni')}
                value={formState.dni}
              />
              <TextField
                error={Boolean(errors.email)}
                fullWidth
                helperText={errors.email ?? ' '}
                label="Email"
                onBlur={() => setTouched(true)}
                onChange={handleChange('email')}
                type="email"
                value={formState.email}
              />
              <TextField
                error={Boolean(errors.telefono)}
                fullWidth
                helperText={errors.telefono ?? ' '}
                inputProps={{ maxLength: 20 }}
                label="Teléfono"
                onBlur={() => setTouched(true)}
                onChange={handleChange('telefono')}
                value={formState.telefono}
              />
              <TextField
                fullWidth
                label="Dirección"
                onChange={handleChange('direccion')}
                value={formState.direccion}
              />
              <TextField
                fullWidth
                label="Referencia de vivienda"
                onChange={handleChange('referenciaVivienda')}
                value={formState.referenciaVivienda}
              />
              <TextField
                error={Boolean(errors.fechaRegistro)}
                fullWidth
                helperText={errors.fechaRegistro ?? ' '}
                label="Fecha de registro"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fechaRegistro')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaRegistro}
              />
              <TextField
                fullWidth
                label="Fecha de baja"
                onChange={handleChange('fechaBaja')}
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fechaBaja}
              />
              <TextField
                fullWidth
                label="Tipo de participante"
                onChange={handleChange('tipoParticipante')}
                select
                value={formState.tipoParticipante}
              >
                <MenuItem value="PADRONADO">PADRONADO</MenuItem>
                <MenuItem value="NO_PADRONADO">NO_PADRONADO</MenuItem>
                <MenuItem value="INVITADO">INVITADO</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Estado"
                onChange={handleChange('estado')}
                select
                value={formState.estado}
              >
                <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
                <MenuItem value="RETIRADO">RETIRADO</MenuItem>
                <MenuItem value="FALLECIDO">FALLECIDO</MenuItem>
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
