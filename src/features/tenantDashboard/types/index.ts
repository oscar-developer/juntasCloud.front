export type ParticipantKpis = {
  padronado: number;
  noPadronado: number;
  invitado: number;
};

export type CashflowKpis = {
  monthlyIncome: number;
  monthlyExpense: number;
  balance: number;
};

export type UpcomingEvent = {
  type: 'FAENA' | 'ASAMBLEA';
  title: string;
  scheduledAt: string | null;
};

export type PendingFineKpis = {
  count: number;
  amount: number;
};

export type TenantDashboardKpis = {
  participants: ParticipantKpis;
  cashflow: CashflowKpis;
  nextFaena: UpcomingEvent | null;
  nextAsamblea: UpcomingEvent | null;
  pendingFines: PendingFineKpis;
};
