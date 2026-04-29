import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAppModules } from '../hooks/useAppModules';
import {
  getTenantProfileErrorMessage,
  getTenantProfileModules,
  replaceTenantProfileModules,
} from '../services/tenantProfiles.service';
import type {
  AccessLevel,
  TenantProfile,
  TenantProfileModule,
} from '../types/tenantProfiles.types';
import { TenantProfileModulesMatrix } from './TenantProfileModulesMatrix';

type TenantProfileModulesDialogProps = {
  open: boolean;
  tenantId: string | number;
  profile: TenantProfile | null;
  onClose: () => void;
  onSaved: () => void;
  onShowMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
};

function buildInitialValues(modules: TenantProfileModule[]) {
  return modules.reduce<Record<string, AccessLevel>>((values, module) => {
    values[module.moduleCode] = module.accessLevel;
    return values;
  }, {});
}

export function TenantProfileModulesDialog({
  open,
  tenantId,
  profile,
  onClose,
  onSaved,
  onShowMessage,
}: TenantProfileModulesDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const appModules = useAppModules(open);
  const [configuredModules, setConfiguredModules] = useState<TenantProfileModule[]>([]);
  const [values, setValues] = useState<Record<string, AccessLevel>>({});
  const [loadingProfileModules, setLoadingProfileModules] = useState(false);
  const [profileModulesError, setProfileModulesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !profile) {
      setConfiguredModules([]);
      setValues({});
      setProfileModulesError(null);
      setSaving(false);
      return;
    }

    const controller = new AbortController();

    const loadModules = async () => {
      setLoadingProfileModules(true);
      setProfileModulesError(null);

      try {
        const response = await getTenantProfileModules(tenantId, profile.idProfile, controller.signal);

        if (!controller.signal.aborted) {
          setConfiguredModules(response);
          setValues(buildInitialValues(response));
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setProfileModulesError(
            getTenantProfileErrorMessage(
              loadError,
              'No se pudieron cargar los permisos configurados.',
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProfileModules(false);
        }
      }
    };

    void loadModules();

    return () => {
      controller.abort();
    };
  }, [open, profile, tenantId]);

  const moduleCodes = useMemo(() => {
    const codes = new Set<string>();

    appModules.modules.forEach((module) => {
      if (module.activo) {
        codes.add(module.moduleCode);
      }
    });

    configuredModules.forEach((module) => {
      codes.add(module.moduleCode);
    });

    return [...codes];
  }, [appModules.modules, configuredModules]);

  const handleAccessChange = (moduleCode: string, accessLevel: AccessLevel) => {
    setValues((current) => ({
      ...current,
      [moduleCode]: accessLevel,
    }));
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    if (appModules.loading || loadingProfileModules) {
      onShowMessage('Espera a que terminen de cargar los módulos.', 'warning');
      return;
    }

    setSaving(true);

    try {
      await replaceTenantProfileModules(tenantId, profile.idProfile, {
        modules: moduleCodes.map((moduleCode) => ({
          moduleCode,
          accessLevel: values[moduleCode] ?? 'SIN_ACCESO',
        })),
      });
      onSaved();
    } catch (saveError) {
      onShowMessage(
        getTenantProfileErrorMessage(saveError, 'No se pudo guardar la configuración de permisos.'),
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const loading = appModules.loading || loadingProfileModules;
  const error = appModules.error ?? profileModulesError;

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      onClose={saving ? undefined : onClose}
      open={open}
    >
      <DialogTitle>Configurar permisos</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography color="text.secondary" variant="body2">
            {profile
              ? `Selecciona el nivel de acceso por módulo para ${profile.nombre}.`
              : 'Selecciona el nivel de acceso por módulo.'}
          </Typography>

          {loading && <LinearProgress sx={{ borderRadius: 999 }} />}
          {error && (
            <Alert
              action={
                appModules.error ? (
                  <Button color="inherit" onClick={appModules.retry} size="small">
                    Reintentar
                  </Button>
                ) : undefined
              }
              severity="error"
            >
              {error}
            </Alert>
          )}

          <TenantProfileModulesMatrix
            appModules={appModules.modules}
            configuredModules={configuredModules}
            disabled={loading || saving || Boolean(error)}
            onChange={handleAccessChange}
            values={values}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={saving} onClick={onClose} variant="text">
          Cancelar
        </Button>
        <Button disabled={loading || saving || Boolean(error)} onClick={handleSave} variant="contained">
          {saving ? <CircularProgress color="inherit" size={20} /> : 'Guardar permisos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
