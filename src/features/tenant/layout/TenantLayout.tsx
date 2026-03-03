import { Alert, Box, Button, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TenantSidebar } from '../components/TenantSidebar';
import { TenantTopBar } from '../components/TenantTopBar';
import { useTenant } from '../context/TenantContext';

const drawerWidth = 280;

export function TenantLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { error, refreshTenant } = useTenant();

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TenantTopBar
        drawerWidth={drawerWidth}
        isMobile={isMobile}
        onMenuClick={() => setMobileOpen(true)}
      />
      <TenantSidebar
        drawerWidth={drawerWidth}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          overflowX: 'hidden',
          p: { xs: 2, md: 3 },
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.95) 18%, rgba(248,250,252,1) 40%)',
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }} />
        {error ? (
          <Alert
            action={
              <Button color="inherit" onClick={refreshTenant} size="small">
                Reintentar
              </Button>
            }
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
}
