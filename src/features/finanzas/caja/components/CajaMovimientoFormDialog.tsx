import {
  Alert,
  Autocomplete,
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
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { getBienById, getBienes } from '../../../bienes/services/bienes.service';
import type { Bien } from '../../../bienes/types';
import { getPersonaById, getPersonas } from '../../../personas/services/personas.service';
import type { Persona } from '../../../personas/types';
import { getCajaCategorias } from '../services/cajaCategorias.service';
import type {
  CajaCategoriaOption,
  CajaMedioPago,
  CajaMovimiento,
  CajaMovimientoTipo,
  CreateMovimientoDto,
} from '../types';
import { getCajaMovimientoErrorMessage, getTipoMovimientoLabel } from './cajaMovimientosUi';

type FormMode = 'create' | 'edit';

type CajaMovimientoFormState = {
  fecha: string;
  tipo: CajaMovimientoTipo;
  monto: string;
  idCategoriaCaja: number | null;
  idPersona: number | null;
  idBien: number | null;
  descripcion: string;
  medioPago: CajaMedioPago;
};

type CajaMovimientoFormErrors = Partial<Record<keyof CajaMovimientoFormState, string>>;

type CajaMovimientoFormDialogProps = {
  open: boolean;
  mode: FormMode;
  tenantId: string;
  movimiento?: CajaMovimiento | null;
  loading: boolean;
  submitting: boolean;
  loadError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateMovimientoDto) => Promise<void>;
  onShowMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

const defaultFormState: CajaMovimientoFormState = {
  fecha: '',
  tipo: 'INGRESO',
  monto: '',
  idCategoriaCaja: null,
  idPersona: null,
  idBien: null,
  descripcion: '',
  medioPago: 'EFECTIVO',
};

const mediosPago: CajaMedioPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'YAPE', 'PLIN', 'OTRO'];

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeId(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getPersonaLabel(persona: Persona) {
  const fullName = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim();

  return persona.dni ? `${fullName} - DNI ${persona.dni}` : fullName;
}

function getBienLabel(bien: Bien) {
  return [bien.descripcion, bien.ubicacion].filter(Boolean).join(' - ') || `Bien #${bien.idBien}`;
}

function mapMovimientoToFormState(movimiento: CajaMovimiento): CajaMovimientoFormState {
  return {
    fecha: movimiento.fecha ? movimiento.fecha.slice(0, 10) : '',
    tipo: movimiento.tipo,
    monto: String(movimiento.monto || ''),
    idCategoriaCaja: movimiento.idCategoriaCaja,
    idPersona: movimiento.idPersona,
    idBien: movimiento.idBien,
    descripcion: movimiento.descripcion ?? '',
    medioPago: movimiento.medioPago,
  };
}

function mapFormToPayload(formState: CajaMovimientoFormState): CreateMovimientoDto {
  return {
    fecha: formState.fecha,
    tipo: formState.tipo,
    monto: Number(formState.monto),
    idCategoriaCaja: formState.idCategoriaCaja!,
    medioPago: formState.medioPago,
    idPersona: formState.idPersona,
    idBien: formState.idBien,
    descripcion: formState.descripcion.trim() || null,
  };
}

function validateForm(formState: CajaMovimientoFormState): CajaMovimientoFormErrors {
  const errors: CajaMovimientoFormErrors = {};
  const monto = Number(formState.monto);

  if (!formState.fecha) {
    errors.fecha = 'La fecha es requerida.';
  }

  if (!Number.isFinite(monto) || monto <= 0) {
    errors.monto = 'El monto debe ser mayor a cero.';
  }

  if (!formState.idCategoriaCaja) {
    errors.idCategoriaCaja = 'La categoría es requerida.';
  }

  if (!formState.medioPago) {
    errors.medioPago = 'El medio de pago es requerido.';
  }

  return errors;
}

function appendUniqueCategoria(options: CajaCategoriaOption[], categoria: CajaCategoriaOption | null) {
  if (!categoria || options.some((option) => option.idCategoriaCaja === categoria.idCategoriaCaja)) {
    return options;
  }

  return [categoria, ...options];
}

function appendUniqueBien(options: Bien[], bien: Bien | null) {
  if (!bien || options.some((option) => String(option.idBien) === String(bien.idBien))) {
    return options;
  }

  return [bien, ...options];
}

export function CajaMovimientoFormDialog({
  open,
  mode,
  tenantId,
  movimiento,
  loading,
  submitting,
  loadError,
  onClose,
  onSubmit,
  onShowMessage,
}: CajaMovimientoFormDialogProps) {
  const [formState, setFormState] = useState<CajaMovimientoFormState>(defaultFormState);
  const [touched, setTouched] = useState(false);
  const [categorias, setCategorias] = useState<CajaCategoriaOption[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [bienes, setBienes] = useState<Bien[]>([]);
  const [bienesLoading, setBienesLoading] = useState(false);
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [personaInput, setPersonaInput] = useState('');
  const [debouncedPersonaInput, setDebouncedPersonaInput] = useState('');
  const [personaOptions, setPersonaOptions] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTouched(false);
    setPersonaOptions([]);
    setSelectedPersona(null);
    setSelectedBien(null);
    setPersonaInput('');
    setDebouncedPersonaInput('');

    if (mode === 'edit' && movimiento) {
      setFormState(mapMovimientoToFormState(movimiento));
      return;
    }

    setFormState({ ...defaultFormState, fecha: getTodayDateString() });
  }, [mode, movimiento, open]);

  useEffect(() => {
    if (!open || !tenantId) {
      return;
    }

    const controller = new AbortController();

    const loadCategorias = async () => {
      setCategoriasLoading(true);

      try {
        const response = await getCajaCategorias(tenantId, { activo: true }, controller.signal);

        if (!controller.signal.aborted) {
          const currentCategoria =
            movimiento && movimiento.idCategoriaCaja
              ? {
                  idCategoriaCaja: movimiento.idCategoriaCaja,
                  nombre: movimiento.categoriaNombre || `Categoría #${movimiento.idCategoriaCaja}`,
                  tipo: movimiento.tipo,
                  activo: true,
                }
              : null;

          setCategorias(appendUniqueCategoria(response, currentCategoria));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onShowMessage(
            getCajaMovimientoErrorMessage(error, 'No se pudieron cargar las categorías de caja.'),
            'error',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriasLoading(false);
        }
      }
    };

    void loadCategorias();

    return () => {
      controller.abort();
    };
  }, [movimiento, onShowMessage, open, tenantId]);

  useEffect(() => {
    if (!open || !tenantId) {
      return;
    }

    const controller = new AbortController();

    const loadBienes = async () => {
      setBienesLoading(true);

      try {
        const [listResponse, currentBien] = await Promise.all([
          getBienes(tenantId, { page: 1, pageSize: 100 }, controller.signal),
          movimiento?.idBien ? getBienById(tenantId, movimiento.idBien, controller.signal) : Promise.resolve(null),
        ]);

        if (!controller.signal.aborted) {
          setSelectedBien(currentBien);
          setBienes(appendUniqueBien(listResponse.items, currentBien));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onShowMessage(getCajaMovimientoErrorMessage(error, 'No se pudieron cargar los bienes.'), 'error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setBienesLoading(false);
        }
      }
    };

    void loadBienes();

    return () => {
      controller.abort();
    };
  }, [movimiento?.idBien, onShowMessage, open, tenantId]);

  useEffect(() => {
    if (!open || !tenantId || !movimiento?.idPersona) {
      return;
    }

    const controller = new AbortController();

    const loadPersona = async () => {
      setPersonaLoading(true);

      try {
        const persona = await getPersonaById(tenantId, movimiento.idPersona!, controller.signal);

        if (!controller.signal.aborted) {
          setSelectedPersona(persona);
          setPersonaOptions([persona]);
          setPersonaInput(getPersonaLabel(persona));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onShowMessage(getCajaMovimientoErrorMessage(error, 'No se pudo cargar la persona asociada.'), 'error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setPersonaLoading(false);
        }
      }
    };

    void loadPersona();

    return () => {
      controller.abort();
    };
  }, [movimiento?.idPersona, onShowMessage, open, tenantId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedPersonaInput(personaInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [personaInput]);

  useEffect(() => {
    if (!open || !tenantId) {
      return;
    }

    if (debouncedPersonaInput.length < 2) {
      setPersonaOptions(selectedPersona ? [selectedPersona] : []);
      return;
    }

    const controller = new AbortController();

    const searchPersonas = async () => {
      setPersonaLoading(true);

      try {
        const response = await getPersonas(
          tenantId,
          { page: 1, pageSize: 10, search: debouncedPersonaInput },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          const nextOptions = selectedPersona
            ? [
                selectedPersona,
                ...response.items.filter((item) => String(item.idPersona) !== String(selectedPersona.idPersona)),
              ]
            : response.items;

          setPersonaOptions(nextOptions);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          onShowMessage(getCajaMovimientoErrorMessage(error, 'No se pudo buscar personas.'), 'error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setPersonaLoading(false);
        }
      }
    };

    void searchPersonas();

    return () => {
      controller.abort();
    };
  }, [debouncedPersonaInput, onShowMessage, open, selectedPersona, tenantId]);

  const filteredCategorias = useMemo(
    () =>
      categorias.filter((categoria) => {
        if (!formState.tipo) {
          return true;
        }

        return categoria.tipo === formState.tipo || categoria.idCategoriaCaja === formState.idCategoriaCaja;
      }),
    [categorias, formState.idCategoriaCaja, formState.tipo],
  );

  const errors = touched ? validateForm(formState) : {};
  const hasErrors = Object.keys(validateForm(formState)).length > 0;

  const handleChange =
    <K extends keyof CajaMovimientoFormState>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleTipoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTipo = event.target.value as CajaMovimientoTipo;

    setFormState((current) => ({
      ...current,
      tipo: nextTipo,
      idCategoriaCaja:
        current.idCategoriaCaja && categorias.some((categoria) => (
          categoria.idCategoriaCaja === current.idCategoriaCaja && categoria.tipo === nextTipo
        ))
          ? current.idCategoriaCaja
          : null,
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
      <DialogTitle>{mode === 'edit' ? 'Editar movimiento de caja' : 'Nuevo movimiento de caja'}</DialogTitle>
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
                error={Boolean(errors.fecha)}
                fullWidth
                helperText={errors.fecha ?? ' '}
                label="Fecha"
                onBlur={() => setTouched(true)}
                onChange={handleChange('fecha')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={formState.fecha}
              />
              <TextField
                fullWidth
                label="Tipo"
                onChange={handleTipoChange}
                select
                value={formState.tipo}
              >
                <MenuItem value="INGRESO">{getTipoMovimientoLabel('INGRESO')}</MenuItem>
                <MenuItem value="GASTO">{getTipoMovimientoLabel('GASTO')}</MenuItem>
              </TextField>
              <TextField
                error={Boolean(errors.monto)}
                fullWidth
                helperText={errors.monto ?? ' '}
                inputProps={{ min: 0.01, step: 0.01 }}
                label="Monto"
                onBlur={() => setTouched(true)}
                onChange={handleChange('monto')}
                required
                type="number"
                value={formState.monto}
              />
              <TextField
                disabled={categoriasLoading}
                error={Boolean(errors.idCategoriaCaja)}
                fullWidth
                helperText={errors.idCategoriaCaja ?? ' '}
                label="Categoría de caja"
                onBlur={() => setTouched(true)}
                onChange={(event) => {
                  setFormState((current) => ({
                    ...current,
                    idCategoriaCaja: normalizeId(event.target.value),
                  }));
                }}
                required
                select
                value={formState.idCategoriaCaja ?? ''}
              >
                <MenuItem value="">Sin selección</MenuItem>
                {filteredCategorias.map((categoria) => (
                  <MenuItem key={categoria.idCategoriaCaja} value={categoria.idCategoriaCaja}>
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                filterOptions={(options) => options}
                getOptionLabel={getPersonaLabel}
                isOptionEqualToValue={(option, value) => String(option.idPersona) === String(value.idPersona)}
                loading={personaLoading}
                onChange={(_, value) => {
                  setSelectedPersona(value);
                  setFormState((current) => ({
                    ...current,
                    idPersona: normalizeId(value?.idPersona),
                  }));
                }}
                onInputChange={(_, value, reason) => {
                  if (reason !== 'reset') {
                    setPersonaInput(value);
                  }
                }}
                options={personaOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    helperText="Escribe al menos 2 caracteres para buscar. Usa Ninguno para dejarlo vacío."
                    label="Persona"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {personaLoading ? <CircularProgress color="inherit" size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
                value={selectedPersona}
              />
              <Button
                disabled={!selectedPersona && !formState.idPersona}
                onClick={() => {
                  setSelectedPersona(null);
                  setPersonaInput('');
                  setPersonaOptions([]);
                  setFormState((current) => ({ ...current, idPersona: null }));
                }}
                sx={{ alignSelf: 'flex-start' }}
                variant="text"
              >
                Ninguno
              </Button>
              <TextField
                disabled={bienesLoading}
                fullWidth
                helperText="Opcional"
                label="Bien"
                onChange={(event) => {
                  const nextId = normalizeId(event.target.value);
                  setSelectedBien(bienes.find((bien) => String(bien.idBien) === String(nextId)) ?? null);
                  setFormState((current) => ({ ...current, idBien: nextId }));
                }}
                select
                value={formState.idBien ?? ''}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {appendUniqueBien(bienes, selectedBien).map((bien) => (
                  <MenuItem key={bien.idBien} value={bien.idBien}>
                    {getBienLabel(bien)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Medio de pago"
                onChange={handleChange('medioPago')}
                required
                select
                value={formState.medioPago}
              >
                {mediosPago.map((medioPago) => (
                  <MenuItem key={medioPago} value={medioPago}>
                    {medioPago}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Descripción"
                minRows={3}
                multiline
                onChange={handleChange('descripcion')}
                value={formState.descripcion}
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
