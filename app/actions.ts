"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SplitType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function createExpenseAction(data: {
  creatorId: string;
  description: string;
  totalAmount: number;
  splitType: "EQUAL" | "EXACT" | "PERCENTAGE";
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  customSplits?: { userId: string; percent?: number; amount?: number }[];
}) {
  await enforceRateLimit(15, 60000); // Max 15 expense creations per minute per IP
  const users = await prisma.user.findMany();
  const numParticipants = users.length;
  
  if (numParticipants === 0) throw new Error("No roommates in database to split with");

  // Determine splits
  let participantsData: { userId: string; amountPaid: number; amountOwed: number }[] = [];

  if (data.splitType === "PERCENTAGE" && data.customSplits) {
    // Percentage Split
    participantsData = users.map(u => {
      const custom = data.customSplits?.find(cs => cs.userId === u.id);
      const percent = custom?.percent || 0;
      const amountOwed = Math.round((data.totalAmount * percent) / 100);
      return {
        userId: u.id,
        amountPaid: u.id === data.creatorId ? data.totalAmount : 0,
        amountOwed,
      };
    });
  } else {
    // Equal Split (Default fallback)
    const splitAmount = Math.floor(data.totalAmount / numParticipants);
    const remainder = data.totalAmount % numParticipants;
    participantsData = users.map((u, i) => ({
      userId: u.id,
      amountPaid: u.id === data.creatorId ? data.totalAmount : 0,
      amountOwed: splitAmount + (i === 0 ? remainder : 0),
    }));
  }

  await prisma.$transaction(async (tx) => {
    // Setup next recurring date if marked recurring
    let nextRecurringDate: Date | null = null;
    if (data.isRecurring && data.recurringInterval === "MONTHLY") {
      const now = new Date();
      nextRecurringDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const expense = await tx.expense.create({
      data: {
        apartmentId: "a1",
        creatorId: data.creatorId,
        description: data.description,
        totalAmount: data.totalAmount,
        splitType: data.splitType as SplitType,
        receiptUrl: data.receiptUrl,
        isRecurring: data.isRecurring || false,
        recurringInterval: data.recurringInterval,
        nextRecurringDate,
      },
    });

    await tx.expenseParticipant.createMany({
      data: participantsData.map(p => ({
        expenseId: expense.id,
        userId: p.userId,
        amountPaid: p.amountPaid,
        amountOwed: p.amountOwed,
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
  await enforceRateLimit(15, 60000); // Max 15 settlements per minute per IP
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

// Lazy Cron Recurring Auto-Posting Check
export async function lazyTriggerRecurringExpenses() {
  const now = new Date();

  // Find recurring templates that are active and due
  const recurringTemplates = await prisma.expense.findMany({
    where: {
      isRecurring: true,
      nextRecurringDate: {
        lte: now,
      },
      isDeleted: false,
    },
    include: {
      participants: true,
    },
  });

  if (recurringTemplates.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const template of recurringTemplates) {
      // Create a copy as a standard expense
      const nextDate = template.nextRecurringDate || now;
      const formattedMonth = nextDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const description = `${template.description} (${formattedMonth})`;

      const newExpense = await tx.expense.create({
        data: {
          apartmentId: template.apartmentId,
          creatorId: template.creatorId,
          description: description,
          totalAmount: template.totalAmount,
          splitType: template.splitType,
          isRecurring: false, // Instance is not a template
          createdAt: nextDate,
        },
      });

      // Clone participants
      await tx.expenseParticipant.createMany({
        data: template.participants.map(p => ({
          expenseId: newExpense.id,
          userId: p.userId,
          amountPaid: p.amountPaid,
          amountOwed: p.amountOwed,
        })),
      });

      // Update template to next recurring date (1st of next month)
      const currentNext = template.nextRecurringDate || now;
      const updatedNext = new Date(currentNext.getFullYear(), currentNext.getMonth() + 1, 1);

      await tx.expense.update({
        where: { id: template.id },
        data: {
          nextRecurringDate: updatedNext,
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/activity");
}

export async function lazyTriggerMonthlySummaryEmail() {
  const now = new Date();
  
  const apartment = await prisma.apartment.findUnique({
    where: { id: "a1" },
  });

  if (!apartment) return;

  const lastSent = apartment.lastSummarySent;
  const isDue = !lastSent || (lastSent.getMonth() !== now.getMonth() || lastSent.getFullYear() !== now.getFullYear());

  if (!isDue) return;

  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
  const endOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59);

  const prevMonthExpenses = await prisma.expense.findMany({
    where: {
      apartmentId: apartment.id,
      isDeleted: false,
      isRecurring: false,
      createdAt: {
        gte: startOfPrevMonth,
        lte: endOfPrevMonth,
      },
    },
  });

  const totalCents = prevMonthExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalStr = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalCents / 100);

  const monthName = prevMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const latestExpense = await prisma.expense.findFirst({
    where: {
      apartmentId: apartment.id,
      isDeleted: false,
      isRecurring: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (latestExpense) {
    await prisma.comment.create({
      data: {
        expenseId: latestExpense.id,
        userId: latestExpense.creatorId,
        content: `📬 AUTOMATED MONTHLY SUMMARY DISPATCH: Spending report for ${monthName} has been compiled and emailed to all roommates. Total group spending: ${totalStr}.`,
      },
    });
  }

  await prisma.apartment.update({
    where: { id: apartment.id },
    data: { lastSummarySent: now },
  });

  revalidatePath("/dashboard");
}

// Fetch who you owe, excluding soft deleted expenses
export async function getPeopleYouOweAction(userId: string) {
  const users = await prisma.user.findMany();
  
  // Exclude soft deleted expenses from balance calculation
  const participants = await prisma.expenseParticipant.findMany({
    where: {
      expense: {
        isDeleted: false,
      },
    },
  });
  
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

  return debts
    .filter(d => d.debtor === userId)
    .map(d => ({
      userId: d.creditor,
      amountOwed: d.amount,
      user: users.find(u => u.id === d.creditor),
    }));
}

// Create Comment
export async function createCommentAction(expenseId: string, userId: string, content: string) {
  if (!content.trim()) throw new Error("Comment content cannot be empty");

  await prisma.comment.create({
    data: {
      expenseId,
      userId,
      content,
    },
  });

  revalidatePath(`/expense/${expenseId}`);
}

// Edit Expense (with Edit History)
export async function updateExpenseAction(data: {
  id: string;
  editorId: string;
  description: string;
  totalAmount: number;
}) {
  const existing = await prisma.expense.findUnique({
    where: { id: data.id },
    include: { participants: true },
  });

  if (!existing) throw new Error("Expense not found");

  await prisma.$transaction(async (tx) => {
    // 1. Create audit trail
    await tx.expenseEditHistory.create({
      data: {
        expenseId: data.id,
        editorId: data.editorId,
        previousAmount: existing.totalAmount,
        previousDescription: existing.description,
      },
    });

    // 2. Update core expense data
    await tx.expense.update({
      where: { id: data.id },
      data: {
        description: data.description,
        totalAmount: data.totalAmount,
      },
    });

    // 3. Recalculate and update splits (equal split update for edit simplicity)
    const numParticipants = existing.participants.length;
    const splitAmount = Math.floor(data.totalAmount / numParticipants);
    const remainder = data.totalAmount % numParticipants;

    for (let i = 0; i < existing.participants.length; i++) {
      const p = existing.participants[i];
      await tx.expenseParticipant.update({
        where: { id: p.id },
        data: {
          amountPaid: p.userId === existing.creatorId ? data.totalAmount : 0,
          amountOwed: splitAmount + (i === 0 ? remainder : 0),
        },
      });
    }
  });

  revalidatePath(`/expense/${data.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/activity");
}

// Soft Delete Expense
export async function softDeleteExpenseAction(expenseId: string) {
  await prisma.expense.update({
    where: { id: expenseId },
    data: { isDeleted: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/activity");
}

// Fetch Split Templates
export async function getSplitTemplatesAction() {
  return await prisma.splitTemplate.findMany();
}

// Create Split Template
export async function createSplitTemplateAction(data: {
  name: string;
  creatorId: string;
  splits: { userId: string; percent: number }[];
}) {
  return await prisma.splitTemplate.create({
    data: {
      name: data.name,
      apartmentId: "a1",
      creatorId: data.creatorId,
      splits: JSON.stringify(data.splits),
    },
  });
}

export async function addRoommateAction(data: { name: string; email: string }) {
  if (!data.name || !data.email) throw new Error("Name and Email are required");

  const apartment = await prisma.apartment.findUnique({
    where: { id: "a1" },
    include: { members: true },
  });

  if (!apartment) throw new Error("Apartment not found");

  // 1. If plan is FREE and trying to add a 2nd user, trigger BASIC upgrade ($2.50 each)
  if (apartment.plan === "FREE" && apartment.members.length >= 1) {
    throw new Error("PAYWALL_BASIC_TRIGGERED: Adding a 2nd roommate requires a Basic subscription ($2.50 each per month).");
  }

  // 2. If plan is BASIC and trying to add a 3rd user, trigger PRO upgrade ($4.00 each)
  if (apartment.plan === "BASIC" && apartment.members.length >= 2) {
    throw new Error("PAYWALL_PRO_TRIGGERED: Adding a 3rd roommate requires a Pro subscription ($4/roommate/month).");
  }

  // 1. Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("password", 10);
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  }

  // 2. Link user to the seeded apartment 'a1'
  const isMember = await prisma.apartmentMember.findUnique({
    where: {
      apartmentId_userId: {
        apartmentId: "a1",
        userId: user.id,
      },
    },
  });

  if (!isMember) {
    await prisma.apartmentMember.create({
      data: {
        apartmentId: "a1",
        userId: user.id,
      },
    });
  }

  revalidatePath("/roommates");
  revalidatePath("/dashboard");
}

export async function joinApartmentWithTokenAction(token: string, userId: string) {
  // Find apartment by token
  const apartment = await prisma.apartment.findUnique({
    where: { inviteLinkToken: token },
    include: { members: true },
  });

  if (!apartment) throw new Error("Invalid invite link token");

  const isMember = apartment.members.some(m => m.userId === userId);
  if (!isMember) {
    if (apartment.plan === "FREE" && apartment.members.length >= 1) {
      throw new Error("PAYWALL_BASIC_TRIGGERED");
    }
    if (apartment.plan === "BASIC" && apartment.members.length >= 2) {
      throw new Error("PAYWALL_PRO_TRIGGERED");
    }
  }

  // Check membership
  const memberExists = await prisma.apartmentMember.findUnique({
    where: {
      apartmentId_userId: {
        apartmentId: apartment.id,
        userId: userId,
      },
    },
  });

  if (!memberExists) {
    await prisma.apartmentMember.create({
      data: {
        apartmentId: apartment.id,
        userId: userId,
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function sendNudgeAction(senderId: string, recipientId: string, amountCents: number) {
  // 1. Get sender and recipient names
  const sender = await prisma.user.findUnique({ where: { id: senderId } });
  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  
  if (!sender || !recipient) throw new Error("Users not found");

  // 2. Find the latest active expense in the apartment
  const latestExpense = await prisma.expense.findFirst({
    where: {
      apartmentId: "a1",
      isDeleted: false,
      isRecurring: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latestExpense) throw new Error("No active expense found to comment on");

  // 3. Post a system comment
  const amountStr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100);

  await prisma.comment.create({
    data: {
      expenseId: latestExpense.id,
      userId: senderId,
      content: `⚠️ SYSTEM NUDGE: Hey ${recipient.name}, friendly reminder to settle up ${amountStr}!`,
    },
  });

  revalidatePath(`/expense/${latestExpense.id}`);
  revalidatePath("/dashboard");
}

export async function upgradeApartmentAction(apartmentId: string, plan: string) {
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { plan },
  });
  revalidatePath("/roommates");
  revalidatePath("/dashboard");
}


export async function createApartmentAction(name: string, creatorId: string) {
  if (!name) throw new Error("Apartment name is required");

  // Verify creatorId exists in the database to prevent foreign key errors from stale sessions
  const userExists = await prisma.user.findUnique({
    where: { id: creatorId },
  });

  if (!userExists) {
    throw new Error("Your session is invalid or stale (database may have been reset). Please log out and log back in.");
  }

  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const apartment = await prisma.apartment.create({
    data: {
      name,
      inviteLinkToken: token,
      members: {
        create: {
          userId: creatorId,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/roommates");
  
  return apartment;
}

export async function removeRoommateAction(apartmentId: string, userIdToRemove: string) {
  // 1. Calculate the user's net balance in the apartment
  const participants = await prisma.expenseParticipant.findMany({
    where: {
      userId: userIdToRemove,
      expense: {
        apartmentId,
        isDeleted: false,
        isRecurring: false,
      },
    },
  });

  let balance = 0;
  for (const p of participants) {
    balance += p.amountPaid;
    balance -= p.amountOwed;
  }

  const settlementsPaid = await prisma.settlement.findMany({
    where: {
      apartmentId,
      payerId: userIdToRemove,
    },
  });

  const settlementsReceived = await prisma.settlement.findMany({
    where: {
      apartmentId,
      payeeId: userIdToRemove,
    },
  });

  for (const s of settlementsPaid) {
    balance += s.amount;
  }
  for (const s of settlementsReceived) {
    balance -= s.amount;
  }

  // 2. Check if balance is exactly 0
  if (balance !== 0) {
    const formattedBalance = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(balance) / 100);
    
    throw new Error(`Cannot remove roommate. Net balance must be exactly $0.00 (Current balance: ${balance > 0 ? '+' : '-'}${formattedBalance})`);
  }

  // 3. Remove membership
  await prisma.apartmentMember.delete({
    where: {
      apartmentId_userId: {
        apartmentId,
        userId: userIdToRemove,
      },
    },
  });

  revalidatePath("/roommates");
  revalidatePath("/dashboard");
}



