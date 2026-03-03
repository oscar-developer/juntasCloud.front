import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type TenantNavEntry = {
  label: string;
  to?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type TenantNavAccordionProps = {
  title: string;
  entries: TenantNavEntry[];
  defaultExpanded?: boolean;
  onNavigate?: () => void;
};

export function TenantNavAccordion({
  title,
  entries,
  defaultExpanded = false,
  onNavigate,
}: TenantNavAccordionProps) {
  const location = useLocation();

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px !important',
        bgcolor: alpha('#FFFFFF', 0.92),
        '&::before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          px: 1.5,
          minHeight: 52,
          '& .MuiAccordionSummary-content': {
            my: 1,
          },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
        <List disablePadding>
          {entries.map((entry) => {
            const selected = Boolean(entry.to) && location.pathname === entry.to;

            if (!entry.to || entry.disabled) {
              return (
                <ListItemButton
                  disabled
                  key={entry.label}
                  sx={{
                    mb: 0.5,
                    minHeight: 46,
                    opacity: 0.72,
                    color: 'text.disabled',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{entry.icon}</ListItemIcon>
                  <ListItemText
                    primary={entry.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  />
                </ListItemButton>
              );
            }

            return (
              <ListItemButton
                component={NavLink}
                key={entry.to}
                onClick={onNavigate}
                selected={selected}
                to={entry.to}
                sx={{
                  mb: 0.5,
                  minHeight: 46,
                  color: selected ? 'primary.main' : 'text.primary',
                  '& .MuiListItemText-primary': {
                    fontSize: 14,
                    fontWeight: selected ? 700 : 600,
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{entry.icon}</ListItemIcon>
                <ListItemText primary={entry.label} />
              </ListItemButton>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
