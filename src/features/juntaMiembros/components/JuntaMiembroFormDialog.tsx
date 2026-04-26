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
import type { JuntaDirectiva } from '../../juntasDirectivas/types';
import type { Persona } from '../../personas/types';
import type {
  JuntaMiembro,
  JuntaMiembroCargo,
  JuntaMiembroCreateDto,
} from '../types';
import { getJuntaLabel } from './juntaMiembrosUi';
import { PersonaRemoteAutocomplete } from './PersonaRemoteAutocomplete';

type FormMode = 'create' | 'edit';

type JuntaMiembroFormState = {
  idJunta: string;
  idPersona: string;
  cargo: JuntaMiembroCargo;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
};

type JuntaMiembroFormErrors = Partial<Record<keyof JuntaMiembroFormState, string>>;

type JuntaMiembroFormDialogProps = {
  open: boolean;
  mode: FormMode;
  juntas: JuntaDirectiva[];
  juntaMiembro?: JuntaMiembro | null;
  selectedPersona: Persona | null;
  initialPersonaOptions: Persona[];
  defaultJuntaId?: string | number | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  checkingAvailability: boolean;
  hasEligiblePersonas: boolean;
  onClose: () => void;
  onSubmit: (payload: JuntaMiembroCreateDto) => Promise<void>;
  onPersonaChange: (persona: Persona | null) => void;
  onSearchPersonas: (search: string, signal?: AbortSignal) => Promise<Persona[]>;
};

const defaultFormState: JuntaMiembroFormState = {
  idJunta: '',
  idPersona: '',
  cargo: 'OTRO',
  fechaInicio: '',
  fechaFin: '',
  observaciones: '',
};

function mapJuntaMiembroToFormState(juntaMiembro: JuntaMiembro): JuntaMiembroFormState {
  return {
    idJunta: String(juntaMiembro.idJunta),
    idPersona: String(juntaMiembro.idPersona),
    cargo: juntaMiembro.cargo,
    fechaInicio: juntaMiembro.fechaInicio ? juntaMiembro.fechaInicio.slice(0, 10) : '',
    fechaFin: juntaMiembro.fechaFin ? juntaMiembro.fechaFin.slice(0, 10) : '',
    observaciones: juntaMiembro.observaciones ?? '',
  };
}

function mapFormToPayload(formState: JuntaMiembroFormState): JuntaMiembroCreateDto {
  return {
    idJunta: formState.idJunta,
    idPersona: formState.idPersona,
    cargo: formState.cargo,
    fechaInicio: formState.fechaInicio,
    fechaFin: formState.fechaFin,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: JuntaMiembroFormState): JuntaMiembroFormErrors {
  const errors: JuntaMiembroFormErrors = {};

  if (!formState.idJunta) {
    errors.idJunta = 'La junta directiva es requerida.';
  }

  if (!formState.idPersona) {
    errors.idPersona = 'La persona es requerida.';
  }

  if (!formState.fechaInicio) {
    errors.fechaInicio = 'La fecha de inicio es requerida.';
  }

  if (!formState.fechaFin) {
    errors.fechaFin = 'La fecha de fin es requerida.';
  }

  return errors;
}

export function JuntaMiembroFormDialog({
  open,
  mode,
  juntas,
  juntaMiembro,
  selectedPersona,
  initialPersonaOptions,
  defaultJuntaId,
  loading,
  submitting,
  loadError,
  checkingAvailability,
  hasEligiblePersonas,
  onClose,
  onSubmit,
  onPersonaChange,
  onSearchPersonas,
}: JuntaMiembroFormDialogProps) {
  const [formState, setFormState] = useState<JuntaMiembroFormState>(defaultFormState);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);

    if (mode === 'create') {
      setFormState({
        ...defaultFormState,
        idJunta: defaultJuntaId ? String(defaultJuntaId) : '',
      });
      return;
    }

    if (juntaMiembro) {
      setFormState(mapJuntaMiembroToFormState(juntaMiembro));
    }
  }, [defaultJuntaId, juntaMiembro, mode, open]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;
  const canUsePersonaSelector = hasEligiblePersonas || Boolean(selectedPersona);

  const handleChange =
    <K extends keyof JuntaMiembroFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handlePersonaChange = (persona: Persona | null) => {
    onPersonaChange(persona);
    setFormState((current) => ({
      ...current,
      idPersona: persona ? String(persona.idPersona) : '',
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (
      Object.keys(validateForm(formState)).length > 0 ||
      loading ||
      submitting ||
      checkingAvailability ||
      !canUsePersonaSelector
    ) {
      return;
    }

    await onSubmit(mapFormToPayload(formState));
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar miembro de junta' : 'Nuevo miembro de junta'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {loadError && <Alert severity="error">{loadError}</Alert>}
              {!checkingAvailability && !canUsePersonaSelector && (
                <Alert severity="warning">
                  No hay personas activas y padronadas disponibles para asignar como miembros de junta.
                </Alert>
              )}
              <TextField
                error={Boolean(errors.idJunta)}
                fullWidth
                helperText={errors.idJunta ?? ' '}
                label="Junta directiva"
                onBlur={() => setTouched(true)}
                onChange={handleChange('idJunta')}
                required
                select
                value={formState.idJunta}
              >
                {juntas.map((junta) => (
                  <MenuItem key={junta.idJunta} value={String(junta.idJunta)}>
                    {getJuntaLabel(junta)}
                  </MenuItem>
                ))}
              </TextField>
              <PersonaRemoteAutocomplete
                disabled={checkingAvailability || !canUsePersonaSelector}
                error={Boolean(errors.idPersona)}
                helperText={errors.idPersona ?? ' '}
                initialOptions={initialPersonaOptions}
                label="Persona"
                onBlur={() => setTouched(true)}
                onChange={handlePersonaChange}
                onSearch={onSearchPersonas}
                required
                value={selectedPersona}
              />
              <TextField
                fullWidth
                label="Cargo"
                onChange={handleChange('cargo')}
                select
                value={formState.cargo}
              >
                <MenuItem value="PRESIDENTE">PRESIDENTE</MenuItem>
                <MenuItem value="VICEPRESIDENTE">VICEPRESIDENTE</MenuItem>
                <MenuItem value="SECRETARIO">SECRETARIO</MenuItem>
                <MenuItem value="TESORERO">TESORERO</MenuItem>
                <MenuItem value="VOCAL">VOCAL</MenuItem>
                <MenuItem value="OTRO">OTRO</MenuItem>
              </TextField>
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
            disabled={
              loading ||
              submitting ||
              checkingAvailability ||
              Boolean(loadError) ||
              hasErrors ||
              !canUsePersonaSelector
            }
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
