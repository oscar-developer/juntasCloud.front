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
import { getPersonaById, getPersonas } from '../../personas/services/personasApi';
import type { Persona } from '../../personas/types';
import {
  createFaenaParticipacion,
  getFaenaParticipacionById,
  updateFaenaParticipacion,
} from '../services/faenaAsistenciaApi';
import type {
  FaenaParticipacion,
  FaenaParticipacionCreateDto,
  FaenaParticipacionEstado,
} from '../types';
import { FaenaParticipacionPersonaAutocomplete } from './FaenaParticipacionPersonaAutocomplete';
import {
  formatFaenaParticipacionTime,
  getFaenaParticipacionErrorMessage,
} from './faenaParticipacionUi';

type ToastSeverity = 'success' | 'error' | 'info' | 'warning';
type FormMode = 'create' | 'edit';

type FaenaParticipacionFormState = {
  idPersona: string;
  estado: FaenaParticipacionEstado;
  horaLlegada: string;
  cantPersonasExtra: string;
  multaGenerada: boolean;
  montoMulta: string;
  observaciones: string;
};

type FaenaParticipacionFormErrors = Partial<Record<keyof FaenaParticipacionFormState, string>>;

type FaenaParticipacionFormDialogProps = {
  open: boolean;
  mode: FormMode;
  tenantId: string;
  faenaId: string;
  participacionId?: string | number | null;
  personaCache: Record<string, Persona>;
  onClose: () => void;
  onSaved: (message: string) => void;
  onShowMessage: (message: string, severity: ToastSeverity) => void;
  onPersonaResolved: (personas: Persona[]) => void;
};

const defaultFormState: FaenaParticipacionFormState = {
  idPersona: '',
  estado: 'PENDIENTE',
  horaLlegada: '',
  cantPersonasExtra: '0',
  multaGenerada: false,
  montoMulta: '',
  observaciones: '',
};

function mapParticipacionToFormState(participacion: FaenaParticipacion): FaenaParticipacionFormState {
  return {
    idPersona: String(participacion.idPersona),
    estado: participacion.estado,
    horaLlegada: participacion.horaLlegada ? formatFaenaParticipacionTime(participacion.horaLlegada) : '',
    cantPersonasExtra: String(participacion.cantPersonasExtra ?? 0),
    multaGenerada: participacion.multaGenerada,
    montoMulta:
      participacion.montoMulta === null || participacion.montoMulta === undefined
        ? ''
        : String(participacion.montoMulta),
    observaciones: participacion.observaciones ?? '',
  };
}

function mapFormToPayload(formState: FaenaParticipacionFormState): FaenaParticipacionCreateDto {
  return {
    idPersona: formState.idPersona,
    estado: formState.estado,
    horaLlegada: formState.horaLlegada || undefined,
    cantPersonasExtra: formState.cantPersonasExtra.trim() ? Number(formState.cantPersonasExtra) : 0,
    multaGenerada: formState.multaGenerada,
    montoMulta:
      formState.multaGenerada && formState.montoMulta.trim()
        ? Number(formState.montoMulta)
        : undefined,
    observaciones: formState.observaciones.trim() || undefined,
  };
}

function validateForm(formState: FaenaParticipacionFormState): FaenaParticipacionFormErrors {
  const errors: FaenaParticipacionFormErrors = {};
  const cantPersonasExtra = Number(formState.cantPersonasExtra);
  const montoMulta = Number(formState.montoMulta);

  if (!formState.idPersona) {
    errors.idPersona = 'La persona es requerida.';
  }

  if (formState.cantPersonasExtra.trim() && (!Number.isFinite(cantPersonasExtra) || cantPersonasExtra < 0 || cantPersonasExtra > 20)) {
    errors.cantPersonasExtra = 'Ingresa un valor entre 0 y 20.';
  }

  if (formState.montoMulta.trim() && (!Number.isFinite(montoMulta) || montoMulta < 0)) {
    errors.montoMulta = 'Ingresa un monto válido.';
  }

  return errors;
}

export function FaenaParticipacionFormDialog({
  open,
  mode,
  tenantId,
  faenaId,
  participacionId,
  personaCache,
  onClose,
  onSaved,
  onShowMessage,
  onPersonaResolved,
}: FaenaParticipacionFormDialogProps) {
  const [formState, setFormState] = useState<FaenaParticipacionFormState>(defaultFormState);
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
            tipoParticipante: 'TODOS',
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
  }, [open, onPersonaResolved, tenantId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);
    setLoadError(null);
    setSubmitting(false);

    if (mode === 'create') {
      setFormState(defaultFormState);
      setSelectedPersona(null);
      setLoading(false);
      return;
    }

    if (!participacionId) {
      setLoadError('No se pudo identificar la participación a editar.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadParticipacion = async () => {
      setLoading(true);

      try {
        const participacion = await getFaenaParticipacionById(tenantId, participacionId, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setFormState(mapParticipacionToFormState(participacion));

        const cachedPersona = personaCache[String(participacion.idPersona)];

        if (cachedPersona) {
          setSelectedPersona(cachedPersona);
        } else {
          try {
            const persona = await getPersonaById(tenantId, participacion.idPersona, controller.signal);

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
          setLoadError(getFaenaParticipacionErrorMessage(error, 'No se pudo cargar la participación.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadParticipacion();

    return () => {
      controller.abort();
    };
  }, [mode, open, participacionId, personaCache, tenantId, onPersonaResolved]);

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;
  const canUsePersonaSelector = hasEligiblePersonas || Boolean(selectedPersona);

  const handleChange =
    <K extends Exclude<keyof FaenaParticipacionFormState, 'multaGenerada'>>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleMultaGeneradaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    setFormState((current) => ({
      ...current,
      multaGenerada: checked,
      montoMulta: checked ? current.montoMulta : '',
    }));
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

    if (Object.keys(validateForm(formState)).length > 0 || loading || submitting || checkingAvailability || !canUsePersonaSelector) {
      return;
    }

    if (mode === 'edit' && !participacionId) {
      onShowMessage('No se pudo identificar la participación a editar.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit') {
        await updateFaenaParticipacion(tenantId, participacionId!, mapFormToPayload(formState));
        onSaved('Participación actualizada correctamente');
      } else {
        await createFaenaParticipacion(tenantId, faenaId, mapFormToPayload(formState));
        onSaved('Participación creada correctamente');
      }
    } catch (error) {
      onShowMessage(getFaenaParticipacionErrorMessage(error, 'No se pudo guardar la participación.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={submitting ? undefined : onClose} open={open}>
      <DialogTitle>{mode === 'edit' ? 'Editar participación' : 'Nueva participación'}</DialogTitle>
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
                  No hay personas activas disponibles para registrar participación.
                </Alert>
              )}
              <FaenaParticipacionPersonaAutocomplete
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
              <TextField fullWidth label="Estado" onChange={handleChange('estado')} select value={formState.estado}>
                <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                <MenuItem value="ASISTIO">ASISTIÓ</MenuItem>
                <MenuItem value="TARDE">TARDE</MenuItem>
                <MenuItem value="FALTO">FALTÓ</MenuItem>
                <MenuItem value="JUSTIFICADO">JUSTIFICADO</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Hora de llegada"
                onChange={handleChange('horaLlegada')}
                slotProps={{ inputLabel: { shrink: true } }}
                type="time"
                value={formState.horaLlegada}
              />
              <TextField
                error={Boolean(errors.cantPersonasExtra)}
                fullWidth
                helperText={errors.cantPersonasExtra ?? ' '}
                label="Personas extra"
                onBlur={() => setTouched(true)}
                onChange={handleChange('cantPersonasExtra')}
                type="number"
                value={formState.cantPersonasExtra}
              />
              <FormControlLabel
                control={<Switch checked={formState.multaGenerada} onChange={handleMultaGeneradaChange} />}
                label="Genera multa"
              />
              <TextField
                disabled={!formState.multaGenerada}
                error={Boolean(errors.montoMulta)}
                fullWidth
                helperText={errors.montoMulta ?? ' '}
                label="Monto de multa"
                onBlur={() => setTouched(true)}
                onChange={handleChange('montoMulta')}
                type="number"
                value={formState.montoMulta}
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
            disabled={loading || submitting || checkingAvailability || Boolean(loadError) || hasErrors || !canUsePersonaSelector}
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
