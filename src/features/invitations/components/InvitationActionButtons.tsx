import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { ReceivedInvitation } from '../types';

type InvitationActionButtonsProps = {
  invitation: ReceivedInvitation;
  loadingAction: 'accept' | 'reject' | null;
  onAccept: (invitation: ReceivedInvitation) => void;
  onReject: (invitation: ReceivedInvitation) => void;
  stacked?: boolean;
};

export function InvitationActionButtons({
  invitation,
  loadingAction,
  onAccept,
  onReject,
  stacked = false,
}: InvitationActionButtonsProps) {
  const canAct = invitation.status === 'PENDING';

  if (!canAct) {
    return (
      <Typography color="text.secondary" variant="caption">
        Sin acciones disponibles
      </Typography>
    );
  }

  return (
    <Stack
      direction={stacked ? 'column' : 'row'}
      justifyContent={stacked ? undefined : 'flex-end'}
      spacing={1}
      sx={{ width: stacked ? '100%' : 'auto' }}
    >
      <Button
        color="error"
        disabled={loadingAction !== null}
        onClick={() => onReject(invitation)}
        size="small"
        variant="outlined"
      >
        {loadingAction === 'reject' ? <CircularProgress color="inherit" size={16} /> : 'Rechazar'}
      </Button>
      <Button
        disabled={loadingAction !== null}
        onClick={() => onAccept(invitation)}
        size="small"
        variant="contained"
      >
        {loadingAction === 'accept' ? <CircularProgress color="inherit" size={16} /> : 'Aceptar'}
      </Button>
    </Stack>
  );
}
