import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import type { Persona } from '../types';
import { PersonaActions } from './PersonaActions';
import { getEstadoChipProps, getFullName, getTipoChipProps } from './personaUi';

type PersonaTableProps = {
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

export function PersonaTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onRetire,
}: PersonaTableProps) {
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre completo</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((persona) => (
              <TableRow hover key={persona.idPersona}>
                <TableCell sx={{ fontWeight: 600 }}>{getFullName(persona)}</TableCell>
                <TableCell>{persona.dni || 'No registrado'}</TableCell>
                <TableCell>{persona.telefono || 'No registrado'}</TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" {...getTipoChipProps(persona.tipoParticipante)} />
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" {...getEstadoChipProps(persona.estado)} />
                </TableCell>
                <TableCell align="right">
                  <PersonaActions onEdit={onEdit} onRetire={onRetire} onView={onView} persona={persona} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        page={Math.max(page - 1, 0)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </>
  );
}
