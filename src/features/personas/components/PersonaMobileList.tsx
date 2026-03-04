import { Box, Card, CardContent, Chip, Stack, TablePagination, Typography } from '@mui/material';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

type PersonaMobileListProps = {
  rows: Persona[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onRetire: (persona: Persona) => void;
};

export function PersonaMobileList({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onRetire,
}: PersonaMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((persona) => (
        <Card elevation={0} key={persona.idPersona}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{getFullName(persona)}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                  DNI: {persona.dni || 'No registrado'}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Teléfono: {persona.telefono || 'No registrado'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
                <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
              </Stack>
              <Stack direction="row" justifyContent="flex-end">
                <PersonaActions onEdit={onEdit} onRetire={onRetire} onView={onView} persona={persona} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Card elevation={0}>
        <TablePagination
          component="div"
          count={total}
          onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
          onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
          page={Math.max(page - 1, 0)}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </Stack>
  );
}
