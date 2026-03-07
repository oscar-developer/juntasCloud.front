import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { formatInvitationDate, getInvitationRoleChipProps, getInvitationStatusChipProps } from './invitationUi';
import type { TenantInvitation } from '../types';

type TenantInvitationsTableProps = {
  rows: TenantInvitation[];
};

export function TenantInvitationsTable({ rows }: TenantInvitationsTableProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Expira</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Creada</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((invitation) => (
            <TableRow hover key={invitation.idInvitation}>
              <TableCell>
                <Box sx={{ fontWeight: 600 }}>{invitation.email}</Box>
              </TableCell>
              <TableCell>
                <Chip size="small" variant="outlined" {...getInvitationRoleChipProps(invitation.role)} />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  {...getInvitationStatusChipProps(invitation.status)}
                />
              </TableCell>
              <TableCell>{formatInvitationDate(invitation.expiresAt)}</TableCell>
              <TableCell>{formatInvitationDate(invitation.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
