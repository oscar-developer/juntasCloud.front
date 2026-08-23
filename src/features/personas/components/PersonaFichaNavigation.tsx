import { Card, Tab, Tabs } from '@mui/material';
import type { PersonaFichaTab } from '../types';

type PersonaFichaNavigationProps = {
  value: PersonaFichaTab;
  onChange: (value: PersonaFichaTab) => void;
};

const tabs: Array<{ value: PersonaFichaTab; label: string }> = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'asistencia', label: 'Asistencia' },
  { value: 'obligaciones', label: 'Obligaciones' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'terrenos', label: 'Terrenos' },
];

export function PersonaFichaNavigation({ value, onChange }: PersonaFichaNavigationProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        position: { xs: 'sticky', md: 'static' },
        top: { xs: 82, md: 'auto' },
        zIndex: 2,
      }}
    >
      <Tabs
        allowScrollButtonsMobile
        onChange={(_event, nextValue: PersonaFichaTab) => onChange(nextValue)}
        scrollButtons="auto"
        value={value}
        variant="scrollable"
        sx={{ px: { xs: 0.5, sm: 1.5 } }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Card>
  );
}
