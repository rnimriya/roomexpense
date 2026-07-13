import { prisma } from "./prisma";

export async function getDashboardData(userId: string) {
  // Load users
  const users = await prisma.user.findMany();
  
  // Load all expense participants (needed for balance calculation) - exclude soft deleted
  const participants = await prisma.expenseParticipant.findMany({
    where: {
      expense: {
        isDeleted: false,
      }
    }
  });
  
  // Load all settlements
  const settlements = await prisma.settlement.findMany();
  
  // Load all expenses - exclude soft deleted and templates
  const expenses = await prisma.expense.findMany({
    where: {
      isDeleted: false,
      isRecurring: false,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Net Balance for a user
  const calculateUserNetBalance = (uId: string) => {
    let netBalance = 0;
    for (const p of participants) {
      if (p.userId === uId) {
        netBalance += p.amountPaid;
        netBalance -= p.amountOwed;
      }
    }
    for (const s of settlements) {
      if (s.payerId === uId) netBalance += s.amount;
      if (s.payeeId === uId) netBalance -= s.amount;
    }
    return netBalance;
  };

  const userNetBalance = calculateUserNetBalance(userId);

  // peer balances calculation (same greedy algorithm as mockData)
  const netBalances = new Map<string, number>();
  for (const u of users) {
    netBalances.set(u.id, calculateUserNetBalance(u.id));
  }

  const debtors = Array.from(netBalances.entries())
    .filter(([_, bal]) => bal < 0)
    .sort((a, b) => a[1] - b[1]);
  const creditors = Array.from(netBalances.entries())
    .filter(([_, bal]) => bal > 0)
    .sort((a, b) => b[1] - a[1]);

  const debts: { debtor: string; creditor: string; amount: number }[] = [];
  let i = 0, j = 0;
  const workingBalances = new Map(netBalances);

  while (i < debtors.length && j < creditors.length) {
    const debtorId = debtors[i][0];
    const creditorId = creditors[j][0];
    
    const debtorBal = workingBalances.get(debtorId) || 0;
    const creditorBal = workingBalances.get(creditorId) || 0;

    const amountToSettle = Math.min(-debtorBal, creditorBal);
    if (amountToSettle > 0) {
      debts.push({ debtor: debtorId, creditor: creditorId, amount: amountToSettle });
      workingBalances.set(debtorId, debtorBal + amountToSettle);
      workingBalances.set(creditorId, creditorBal - amountToSettle);
    }
    
    if ((workingBalances.get(debtorId) || 0) === 0) i++;
    if ((workingBalances.get(creditorId) || 0) === 0) j++;
  }

  const peerBalancesMap = new Map<string, number>();
  for (const u of users) {
    if (u.id !== userId) {
      peerBalancesMap.set(u.id, 0);
    }
  }

  for (const debt of debts) {
    if (debt.debtor === userId) {
      peerBalancesMap.set(debt.creditor, (peerBalancesMap.get(debt.creditor) || 0) - debt.amount);
    } else if (debt.creditor === userId) {
      peerBalancesMap.set(debt.debtor, (peerBalancesMap.get(debt.debtor) || 0) + debt.amount);
    }
  }

  const peerBalances = Array.from(peerBalancesMap.entries()).map(([uId, amount]) => ({
    userId: uId,
    amount,
  }));

  // Recent activity: Combine last 5 expenses and settlements
  const recentActivity = [
    ...expenses.map(e => ({ type: "expense" as const, date: e.createdAt, data: e })),
    ...settlements.map(s => ({ type: "settlement" as const, date: s.createdAt, data: s })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return {
    netBalance: userNetBalance,
    peerBalances,
    recentActivity,
    users,
    simplifiedDebts: debts,
  };
}
