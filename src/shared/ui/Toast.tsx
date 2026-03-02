import { Alert, Snackbar, type AlertColor } from '@mui/material';

type ToastProps = {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
};

export function Toast({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 4000,
}: ToastProps) {
  return (
    <Snackbar
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => {
        if (reason === 'clickaway') {
          return;
        }

        onClose();
      }}
      open={open}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
