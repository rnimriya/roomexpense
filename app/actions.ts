"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SplitType } from "@prisma/client";

export async function createExpenseAction(data: {
  creatorId: string;
  description: string;
  totalAmount: number;
  splitType: "EQUAL" | "EXACT" | "PERCENTAGE";
}) {
  const users = await prisma.user.findMany();
  const numParticipants = users.length;
  
  if (numParticipants === 0) throw new Error("No roommates in database to split with");

  // Split calculations
  const splitAmount = Math.floor(data.totalAmount / numParticipants);
  const remainder = data.totalAmount % numParticipants;

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        apartmentId: "a1", // Seeded apartment ID
        creatorId: data.creatorId,
        description: data.description,
        totalAmount: data.totalAmount,
        splitType: data.splitType as SplitType,
      },
    });

    // Create participant records
    await tx.expenseParticipant.createMany({
      data: users.map((u, i) => ({
        expenseId: expense.id,
        userId: u.id,
        amountPaid: u.id === data.creatorId ? data.totalAmount : 0,
        amountOwed: splitAmount + (i === 0 ? remainder : 0), // give remainder to the first user
      })),
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/activity");
}

export async function createSettlementAction(data: {
  payerId: string;
  payeeId: string;
  amount: number;
}) {
  await prisma.settlement.create({
    data: {
      apartmentId: "a1",
      payerId: data.payerId,
      payeeId: data.payeeId,
      amount: data.amount,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/activity");
}

export async function getPeopleYouOweAction(userId: string) {
  const users = await prisma.user.findMany();
  const participants = await prisma.expenseParticipant.findMany();
  const settlements = await prisma.settlement.findMany();

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

  // Greedy debt simplification
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

  // Filter who the current user owes
  const peopleOwed = debts
    .filter(d => d.debtor === userId)
    .map(d => ({
      userId: d.creditor,
      amountOwed: d.amount,
      user: users.find(u => u.id === d.creditor),
    }));

  return peopleOwed;
}
