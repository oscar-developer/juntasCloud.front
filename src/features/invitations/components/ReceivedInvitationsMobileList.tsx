import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { InvitationActionButtons } from './InvitationActionButtons';
import { formatInvitationDate, getInvitationRoleChipProps, getInvitationStatusChipProps } from './invitationUi';
import type { ReceivedInvitation } from '../types';

type ReceivedInvitationsMobileListProps = {
  rows: ReceivedInvitation[];
  actionLoadingId: string | number | null;
  actionLoadingType: 'accept' | 'reject' | null;
  onAccept: (invitation: ReceivedInvitation) => void;
  onReject: (invitation: ReceivedInvitation) => void;
};

export function ReceivedInvitationsMobileList({
  rows,
  actionLoadingId,
  actionLoadingType,
  onAccept,
  onReject,
}: ReceivedInvitationsMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((invitation) => (
        <Card elevation={0} key={invitation.idInvitation}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                  Junta #{invitation.idTenant}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                  {invitation.email}
                </Typography>
              </Box>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                <Chip size="small" variant="outlined" {...getInvitationRoleChipProps(invitation.role)} />
                <Chip
                  size="small"
                  variant="outlined"
                  {...getInvitationStatusChipProps(invitation.status)}
                />
              </Stack>

              <Stack spacing={1}>
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
                    Expira
                  </Typography>
                  <Typography variant="body2">{formatInvitationDate(invitation.expiresAt)}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
                    Creada
                  </Typography>
                  <Typography variant="body2">{formatInvitationDate(invitation.createdAt)}</Typography>
                </Box>
              </Stack>

              <InvitationActionButtons
                invitation={invitation}
                loadingAction={
                  actionLoadingId !== null && String(actionLoadingId) === String(invitation.idInvitation)
                    ? actionLoadingType
                    : null
                }
                onAccept={onAccept}
                onReject={onReject}
                stacked
              />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
