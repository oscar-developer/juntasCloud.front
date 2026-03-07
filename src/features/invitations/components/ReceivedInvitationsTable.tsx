import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { InvitationActionButtons } from './InvitationActionButtons';
import { formatInvitationDate, getInvitationRoleChipProps, getInvitationStatusChipProps } from './invitationUi';
import type { ReceivedInvitation } from '../types';

type ReceivedInvitationsTableProps = {
  rows: ReceivedInvitation[];
  actionLoadingId: string | number | null;
  actionLoadingType: 'accept' | 'reject' | null;
  onAccept: (invitation: ReceivedInvitation) => void;
  onReject: (invitation: ReceivedInvitation) => void;
};

export function ReceivedInvitationsTable({
  rows,
  actionLoadingId,
  actionLoadingType,
  onAccept,
  onReject,
}: ReceivedInvitationsTableProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 940 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 700 }}>Junta</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Expira</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Creada</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((invitation) => (
            <TableRow hover key={invitation.idInvitation}>
              <TableCell>
                <Box sx={{ fontWeight: 600 }}>Junta #{invitation.idTenant}</Box>
              </TableCell>
              <TableCell>{invitation.email}</TableCell>
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
              <TableCell align="right">
                <InvitationActionButtons
                  invitation={invitation}
                  loadingAction={
                    actionLoadingId !== null && String(actionLoadingId) === String(invitation.idInvitation)
                      ? actionLoadingType
                      : null
                  }
                  onAccept={onAccept}
                  onReject={onReject}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
