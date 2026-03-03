import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type KpiSummaryCardProps = {
  title: string;
  value: string;
  caption: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function KpiSummaryCard({ title, value, caption, icon, children }: KpiSummaryCardProps) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.5}>
            <Typography color="text.secondary" sx={{ fontWeight: 700 }} variant="body2">
              {title}
            </Typography>
            {icon}
          </Stack>
          <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, lineHeight: 1.05 }}>
            {value}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {caption}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
