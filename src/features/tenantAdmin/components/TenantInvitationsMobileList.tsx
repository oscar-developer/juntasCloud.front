import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatInvitationDate, getInvitationRoleChipProps, getInvitationStatusChipProps } from './invitationUi';
import type { TenantInvitation } from '../types';

type TenantInvitationsMobileListProps = {
  rows: TenantInvitation[];
};

export function TenantInvitationsMobileList({ rows }: TenantInvitationsMobileListProps) {
  return (
    <Stack spacing={2}>
      {rows.map((invitation) => (
        <Card elevation={0} key={invitation.idInvitation}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>
                  {invitation.email}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                  Invitación #{invitation.idInvitation}
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
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
