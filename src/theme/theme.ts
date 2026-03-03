import { alpha, createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#EB7A3C',
      dark: '#D9682E',
      light: '#F3B18D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64748B',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#3B82F6',
    },
    divider: '#E2E8F0',
    action: {
      hover: alpha('#EB7A3C', 0.06),
      selected: alpha('#EB7A3C', 0.12),
      focus: alpha('#EB7A3C', 0.16),
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.12,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.55,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          minHeight: 48,
          paddingInline: 18,
        },
        contained: {
          boxShadow: '0 8px 20px rgba(235, 122, 60, 0.16)',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 10px 24px rgba(217, 104, 46, 0.2)',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
        },
        elevation2: {
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.07)',
        },
        elevation3: {
          boxShadow: '0 16px 38px rgba(15, 23, 42, 0.09)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          boxShadow: '0 10px 26px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
        filled: {
          backgroundColor: alpha('#EB7A3C', 0.08),
          color: '#0F172A',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#94A3B8',
          '&.Mui-checked': {
            color: '#EB7A3C',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 10,
          '&.Mui-selected': {
            backgroundColor: alpha('#EB7A3C', 0.14),
            color: '#EB7A3C',
            boxShadow: 'inset 0 0 0 1px rgba(235, 122, 60, 0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha('#EB7A3C', 0.18),
          },
          '&:hover': {
            backgroundColor: alpha('#EB7A3C', 0.05),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E2E8F0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#EB7A3C',
            borderWidth: 1,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});
