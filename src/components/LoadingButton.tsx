import { Button, CircularProgress, type ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({
  children,
  loading = false,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <CircularProgress color="inherit" size={20} /> : children}
    </Button>
  );
}
