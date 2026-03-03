import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTenant } from '../context/TenantContext';

type TenantTopBarProps = {
  drawerWidth: number;
  isMobile: boolean;
  onMenuClick: () => void;
};

export function TenantTopBar({ drawerWidth, isMobile, onMenuClick }: TenantTopBarProps) {
  const { leaveTenant, loading, tenant } = useTenant();

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(18px)',
        bgcolor: alpha('#FFFFFF', 0.9),
      }}
    >
      <Toolbar sx={{ minHeight: 80, px: { xs: 1, sm: 1.5, md: 3 } }}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', minWidth: 0, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
        >
          {isMobile && (
            <IconButton edge="start" onClick={onMenuClick}>
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {loading ? (
              <>
                <Skeleton height={30} sx={{ maxWidth: 280 }} width="60%" />
                <Skeleton height={22} sx={{ maxWidth: 220 }} width="40%" />
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: { xs: 21, md: 26 }, fontWeight: 800, lineHeight: 1.05 }}>
                  {tenant?.nombre ?? 'Junta'}
                </Typography>
                <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography color="text.secondary" variant="body2">
                    Junta
                  </Typography>
                  {tenant && (
                    <Chip
                      color={tenant.estado === 'ACTIVO' ? 'success' : 'default'}
                      label={tenant.estado}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Stack>
              </>
            )}
          </Box>

          <Button
            onClick={leaveTenant}
            size={isMobile ? 'small' : 'medium'}
            startIcon={<SwapHorizRoundedIcon />}
            sx={{ flexShrink: 0, ml: 'auto' }}
            variant="outlined"
          >
            Cambiar junta
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
