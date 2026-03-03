import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Grid, Skeleton, Stack, Typography } from '@mui/material';
import type { TenantDashboardKpis } from '../types';
import { KpiSummaryCard } from './KpiSummaryCard';
import { UpcomingEventsCard } from './UpcomingEventsCard';

type KpiCardsProps = {
  data: TenantDashboardKpis | null;
  loading: boolean;
};

function CurrencyValue({ value }: { value: number }) {
  return (
    <Typography sx={{ fontWeight: 700 }} variant="body2">
      {new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        maximumFractionDigits: 2,
      }).format(value)}
    </Typography>
  );
}

function LoadingCards() {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, md: 6 }}>
          <Skeleton height={220} variant="rounded" />
        </Grid>
      ))}
    </Grid>
  );
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) {
    return <LoadingCards />;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <KpiSummaryCard
          caption="Distribución del padrón y participación actual."
          icon={<GroupsRoundedIcon color="primary" fontSize="small" />}
          title="Personas"
          value={String(
            data.participants.padronado + data.participants.noPadronado + data.participants.invitado,
          )}
        >
          <Stack spacing={1.25}>
            <Typography color="text.secondary" variant="body2">
              Padronado: <strong>{data.participants.padronado}</strong>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              No padronado: <strong>{data.participants.noPadronado}</strong>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Invitado: <strong>{data.participants.invitado}</strong>
            </Typography>
          </Stack>
        </KpiSummaryCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <KpiSummaryCard
          caption="Movimiento acumulado del mes en caja."
          icon={<PaidRoundedIcon color="primary" fontSize="small" />}
          title="Caja"
          value={new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            maximumFractionDigits: 2,
          }).format(data.cashflow.balance)}
        >
          <Stack spacing={1.25}>
            <CurrencyValue value={data.cashflow.monthlyIncome} />
            <Typography color="text.secondary" variant="body2">
              Ingresos del mes
            </Typography>
            <CurrencyValue value={data.cashflow.monthlyExpense} />
            <Typography color="text.secondary" variant="body2">
              Gastos del mes
            </Typography>
          </Stack>
        </KpiSummaryCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <UpcomingEventsCard nextAsamblea={data.nextAsamblea} nextFaena={data.nextFaena} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <KpiSummaryCard
          caption="Faltas y tardanzas pendientes de regularización."
          icon={<WarningAmberRoundedIcon color="warning" fontSize="small" />}
          title="Multas pendientes"
          value={String(data.pendingFines.count)}
        >
          <CurrencyValue value={data.pendingFines.amount} />
        </KpiSummaryCard>
      </Grid>
    </Grid>
  );
}
