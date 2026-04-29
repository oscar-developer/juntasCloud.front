import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { AccessLevel, AppModule, TenantProfileModule } from '../types/tenantProfiles.types';
import { ACCESS_LEVEL_LABELS } from './tenantProfileUi';

type TenantProfileModulesMatrixProps = {
  appModules: AppModule[];
  configuredModules: TenantProfileModule[];
  values: Record<string, AccessLevel>;
  disabled?: boolean;
  onChange: (moduleCode: string, accessLevel: AccessLevel) => void;
};

type MatrixModule = AppModule & {
  accessLevel: AccessLevel;
};

const accessLevels: AccessLevel[] = ['SIN_ACCESO', 'SOLO_LECTURA', 'ACCESO_TOTAL'];

function buildMatrixModules(
  appModules: AppModule[],
  configuredModules: TenantProfileModule[],
  values: Record<string, AccessLevel>,
): MatrixModule[] {
  const configuredByCode = new Map(configuredModules.map((module) => [module.moduleCode, module]));
  const activeAppModules = appModules.filter((module) => module.activo || configuredByCode.has(module.moduleCode));
  const moduleMap = new Map<string, MatrixModule>();

  activeAppModules.forEach((module) => {
    const configured = configuredByCode.get(module.moduleCode);

    moduleMap.set(module.moduleCode, {
      ...module,
      accessLevel: values[module.moduleCode] ?? configured?.accessLevel ?? 'SIN_ACCESO',
    });
  });

  configuredModules.forEach((module) => {
    if (moduleMap.has(module.moduleCode)) {
      return;
    }

    moduleMap.set(module.moduleCode, {
      moduleCode: module.moduleCode,
      nombre: module.nombre,
      grupo: module.grupo,
      orden: module.orden,
      activo: module.activo ?? true,
      accessLevel: values[module.moduleCode] ?? module.accessLevel ?? 'SIN_ACCESO',
    });
  });

  return [...moduleMap.values()].sort((left, right) => {
    const groupCompare = left.grupo.localeCompare(right.grupo, 'es');

    if (groupCompare !== 0) {
      return groupCompare;
    }

    return left.orden - right.orden || left.nombre.localeCompare(right.nombre, 'es');
  });
}

function groupModules(modules: MatrixModule[]) {
  return modules.reduce<Record<string, MatrixModule[]>>((groups, module) => {
    const group = module.grupo || 'General';

    groups[group] = groups[group] ? [...groups[group], module] : [module];
    return groups;
  }, {});
}

export function TenantProfileModulesMatrix({
  appModules,
  configuredModules,
  values,
  disabled = false,
  onChange,
}: TenantProfileModulesMatrixProps) {
  const matrixModules = buildMatrixModules(appModules, configuredModules, values);
  const groupedModules = groupModules(matrixModules);
  const groupNames = Object.keys(groupedModules);

  if (matrixModules.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">No hay módulos disponibles</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
          Cuando existan módulos globales podrás asignar permisos a este perfil.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack divider={<Divider flexItem />} spacing={2.5}>
      {groupNames.map((groupName) => (
        <Stack key={groupName} spacing={1.5}>
          <Typography sx={{ fontWeight: 800 }} variant="h6">
            {groupName}
          </Typography>

          <Stack spacing={1.25}>
            {groupedModules[groupName].map((module) => (
              <Stack
                alignItems={{ xs: 'stretch', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                key={module.moduleCode}
                spacing={1.5}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{module.nombre}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    {module.moduleCode}
                  </Typography>
                </Box>

                <ToggleButtonGroup
                  color="primary"
                  disabled={disabled}
                  exclusive
                  fullWidth
                  onChange={(_, nextValue: AccessLevel | null) => {
                    if (nextValue) {
                      onChange(module.moduleCode, nextValue);
                    }
                  }}
                  size="small"
                  value={values[module.moduleCode] ?? module.accessLevel}
                  sx={{
                    width: { xs: '100%', md: 'auto' },
                    '& .MuiToggleButton-root': {
                      minWidth: { xs: 0, md: 116 },
                      px: { xs: 1, md: 1.5 },
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  {accessLevels.map((accessLevel) => (
                    <ToggleButton key={accessLevel} value={accessLevel}>
                      {ACCESS_LEVEL_LABELS[accessLevel]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
