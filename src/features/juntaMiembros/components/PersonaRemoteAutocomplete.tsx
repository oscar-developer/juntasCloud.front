import {
  Autocomplete,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getPersonas } from '../../personas/services/personas.service';
import type { Persona } from '../../personas/types';
import { getPersonaOptionLabel } from './juntaMiembrosUi';

type PersonaRemoteAutocompleteProps = {
  tenantId: string;
  initialOptions?: Persona[];
  label: string;
  value: Persona | null;
  onChange: (persona: Persona | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
};

function mergeUniquePersonas(personas: Array<Persona | null | undefined>) {
  const map = new Map<string, Persona>();

  personas.forEach((persona) => {
    if (!persona) {
      return;
    }

    map.set(String(persona.idPersona), persona);
  });

  return Array.from(map.values());
}

export function PersonaRemoteAutocomplete({
  tenantId,
  initialOptions = [],
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText,
  onBlur,
}: PersonaRemoteAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => (value ? getPersonaOptionLabel(value) : ''));
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [options, setOptions] = useState<Persona[]>(() => mergeUniquePersonas([value, ...initialOptions]));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [inputValue]);

  useEffect(() => {
    if (debouncedSearch) {
      setOptions((current) => mergeUniquePersonas([value, ...current]));
      return;
    }

    setLoadError(null);
    setHasLoaded(true);
    setOptions(mergeUniquePersonas([value, ...initialOptions]));
  }, [debouncedSearch, initialOptions, value]);

  useEffect(() => {
    if (open && debouncedSearch) {
      return;
    }

    setInputValue(value ? getPersonaOptionLabel(value) : '');
  }, [debouncedSearch, open, value]);

  useEffect(() => {
    if (!open || disabled || !debouncedSearch) {
      return;
    }

    const controller = new AbortController();

    const loadOptions = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await getPersonas(
          tenantId,
          {
            page: 1,
            pageSize: 20,
            search: debouncedSearch,
            dni: '',
            estado: 'ACTIVO',
            tipoParticipante: 'PADRONADO',
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setHasLoaded(true);
          setOptions(mergeUniquePersonas([value, ...response.items]));
        }
      } catch (loadOptionsError) {
        if (!controller.signal.aborted) {
          setHasLoaded(true);
          setLoadError(
            loadOptionsError instanceof Error && loadOptionsError.message.trim()
              ? loadOptionsError.message
              : 'No se pudo cargar la lista de personas.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, disabled, open, tenantId, value]);

  const noOptionsText = useMemo(() => {
    if (loadError) {
      return 'No se pudo cargar personas';
    }

    if (!hasLoaded && !loading) {
      return 'Escribe para buscar personas';
    }

    if (debouncedSearch) {
      return 'No se encontraron resultados para la búsqueda';
    }

    return 'No hay personas activas padronadas';
  }, [debouncedSearch, hasLoaded, loadError, loading]);

  return (
    <Autocomplete
      disabled={disabled}
      filterOptions={(items) => items}
      getOptionLabel={getPersonaOptionLabel}
      inputValue={inputValue}
      isOptionEqualToValue={(option, currentValue) => String(option.idPersona) === String(currentValue.idPersona)}
      loading={loading}
      loadingText="Buscando personas..."
      noOptionsText={noOptionsText}
      onChange={(_, nextValue) => {
        setInputValue(nextValue ? getPersonaOptionLabel(nextValue) : '');
        setDebouncedSearch('');
        setOpen(false);
        onChange(nextValue);
      }}
      onClose={() => setOpen(false)}
      onInputChange={(_, nextInputValue, reason) => {
        if (reason === 'clear') {
          setInputValue('');
          setDebouncedSearch('');
          return;
        }

        if (reason === 'input') {
          setInputValue(nextInputValue);
          return;
        }

        if (reason === 'reset') {
          setInputValue(nextInputValue);
        }
      }}
      onOpen={() => setOpen(true)}
      open={open}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error || Boolean(loadError)}
          helperText={loadError ?? helperText ?? ' '}
          label={label}
          onBlur={onBlur}
          required={required}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      value={value}
    />
  );
}
