import type { TenantDashboardKpis } from '../types';

function createMockKpis(tenantId: string): TenantDashboardKpis {
  const seed = tenantId
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  const monthlyIncome = 1200 + (seed % 7) * 175;
  const monthlyExpense = 700 + (seed % 5) * 120;

  return {
    participants: {
      padronado: 56 + (seed % 9),
      noPadronado: 14 + (seed % 4),
      invitado: 6 + (seed % 3),
    },
    cashflow: {
      monthlyIncome,
      monthlyExpense,
      balance: monthlyIncome - monthlyExpense,
    },
    nextFaena: {
      type: 'FAENA',
      title: 'Faena comunal de limpieza',
      scheduledAt: '2026-03-14T09:00:00-05:00',
    },
    nextAsamblea: {
      type: 'ASAMBLEA',
      title: 'Asamblea ordinaria mensual',
      scheduledAt: '2026-03-22T18:30:00-05:00',
    },
    pendingFines: {
      count: 8 + (seed % 5),
      amount: 320 + (seed % 8) * 35,
    },
  };
}

export async function getTenantDashboardKpis(
  tenantId: string,
  signal?: AbortSignal,
): Promise<TenantDashboardKpis> {
  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      resolve();
    }, 220);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

  return createMockKpis(tenantId);
}
