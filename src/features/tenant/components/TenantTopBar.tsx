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
          direction="row"
          spacing={1.5}
          alignItems="center" // Mantiene todo centrado verticalmente si el texto crece
          sx={{ 
            width: '100%', 
            minWidth: 0, 
            flexWrap: 'nowrap' // <-- CAMBIO CLAVE: Evita que el botón baje
          }}
        >
          {isMobile && (
            <IconButton edge="start" onClick={onMenuClick} sx={{ flexShrink: 0 }}>
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
                <Typography
                  sx={{
                    fontSize: { xs: 19, md: 26 }, // Bajé un poco el min en mobile para dar aire
                    fontWeight: 800,
                    lineHeight: 1.1,
                    wordBreak: 'break-word', // <-- Permite que el texto largo se rompa en palabras
                    overflowWrap: 'anywhere'
                  }}
                >
                  {tenant?.nombre ?? 'Junta'}
                </Typography>
                
                <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography color="text.secondary" variant="body2">
                    Junta
                  </Typography>
                  {tenant && (
                    <Chip
                      color={tenant.estado === 'ACTIVO' ? 'success' : 'default'}
                      label={tenant.estado}
                      size="small"
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
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
            variant="outlined"
            sx={{ 
              flexShrink: 0, // <-- CRÍTICO: Evita que el botón se comprima
              ml: 1,
              whiteSpace: 'nowrap' // Evita que el texto del botón se rompa
            }}
          >
            {!isMobile && "Cambiar junta"}
            {isMobile && "Cambiar"} 
          </Button>
        </Stack>
      </Toolbar>
      
    </AppBar>
  );
}
