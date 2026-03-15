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
import {
  getPersonaById,
  getPersonas,
} from '../../personas/services/personasApi';
import type { Persona } from '../../personas/types';
import {
  createJuntaMiembro,
  getJuntaMiembroById,
  updateJuntaMiembro,
} from '../services/juntaMiembrosApi';
import type {
  JuntaMiembro,
  JuntaMiembroCargo,
  JuntaMiembroCreateDto,
} from '../types';
import {
  getJuntaLabel,
  getJuntaMiembroErrorMessage,
} from './juntaMiembrosUi';
import { PersonaRemoteAutocomplete } from './PersonaRemoteAutocomplete';

type ToastSeverity = 'success' | 'error' | 'info' | 'warning';
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
  tenantId: string;
  juntaMiembroId?: string | number | null;
  juntas: JuntaDirectiva[];
  personaCache: Record<string, Persona>;
  defaultJuntaId?: string | number | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onShowMessage: (message: string, severity: ToastSeverity) => void;
  onPersonaResolved: (personas: Persona[]) => void;
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
  tenantId,
  juntaMiembroId,
  juntas,
  personaCache,
  defaultJuntaId,
  onClose,
  onSaved,
  onShowMessage,
  onPersonaResolved,
}: JuntaMiembroFormDialogProps) {
  const [formState, setFormState] = useState<JuntaMiembroFormState>(defaultFormState);
  const [initialPersonaOptions, setInitialPersonaOptions] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [hasEligiblePersonas, setHasEligiblePersonas] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      setInitialPersonaOptions([]);

      try {
        const response = await getPersonas(
          tenantId,
          {
            page: 1,
            pageSize: 20,
            search: '',
            dni: '',
            estado: 'ACTIVO',
            tipoParticipante: 'PADRONADO',
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setInitialPersonaOptions(response.items);
          setHasEligiblePersonas(response.total > 0);
          onPersonaResolved(response.items);
        }
      } catch {
        if (!controller.signal.aborted) {
          setInitialPersonaOptions([]);
          setHasEligiblePersonas(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingAvailability(false);
        }
      }
    };

    void checkAvailability();

    return () => {
      controller.abort();
    };
  }, [open, tenantId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);
    setLoadError(null);
    setSubmitting(false);

    if (mode === 'create') {
      setFormState({
        ...defaultFormState,
        idJunta: defaultJuntaId ? String(defaultJuntaId) : '',
      });
      setSelectedPersona(null);
      setLoading(false);
      return;
    }

    if (!juntaMiembroId) {
      setLoadError('No se pudo identificar el miembro de junta a editar.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadJuntaMiembro = async () => {
      setLoading(true);

      try {
        const juntaMiembro = await getJuntaMiembroById(tenantId, juntaMiembroId, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setFormState(mapJuntaMiembroToFormState(juntaMiembro));

        const cachedPersona = personaCache[String(juntaMiembro.idPersona)];

        if (cachedPersona) {
          setSelectedPersona(cachedPersona);
        } else {
          try {
            const persona = await getPersonaById(tenantId, juntaMiembro.idPersona, controller.signal);

            if (!controller.signal.aborted) {
              setSelectedPersona(persona);
              onPersonaResolved([persona]);
            }
          } catch {
            setSelectedPersona(null);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            getJuntaMiembroErrorMessage(error, 'No se pudo cargar el miembro de junta.'),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadJuntaMiembro();

    return () => {
      controller.abort();
    };
  }, [defaultJuntaId, juntaMiembroId, mode, onPersonaResolved, open, tenantId]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;
  const canUsePersonaSelector = hasEligiblePersonas || Boolean(selectedPersona);

  const handleChange =
    <K extends keyof JuntaMiembroFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handlePersonaChange = (persona: Persona | null) => {
    setSelectedPersona(persona);
    setFormState((current) => ({
      ...current,
      idPersona: persona ? String(persona.idPersona) : '',
    }));

    if (persona) {
      onPersonaResolved([persona]);
    }
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

    if (mode === 'edit' && !juntaMiembroId) {
      onShowMessage('No se pudo identificar el miembro de junta a editar.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit') {
        await updateJuntaMiembro(tenantId, juntaMiembroId!, mapFormToPayload(formState));
        onSaved('Miembro de junta actualizado correctamente');
      } else {
        await createJuntaMiembro(tenantId, mapFormToPayload(formState));
        onSaved('Miembro de junta creado correctamente');
      }
    } catch (error) {
      onShowMessage(
        getJuntaMiembroErrorMessage(error, 'No se pudo guardar el miembro de junta.'),
        'error',
      );
    } finally {
      setSubmitting(false);
    }
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
                required
                tenantId={tenantId}
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
