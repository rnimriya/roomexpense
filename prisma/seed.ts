import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import "dotenv/config";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const SplitType = {
  EQUAL: "EQUAL",
  EXACT: "EXACT",
  PERCENTAGE: "PERCENTAGE"
};

async function main() {
  // Clear existing database
  await prisma.expenseEditHistory.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.splitTemplate.deleteMany({});
  await prisma.settlement.deleteMany({});
  await prisma.expenseParticipant.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.apartmentMember.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("password", 10);

  // 1. Create Users
  const alice = await prisma.user.create({
    data: {
      id: "u1",
      name: "Alice",
      email: "alice@example.com",
      password: hashedPassword,
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "u2",
      name: "Bob",
      email: "bob@example.com",
      password: hashedPassword,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: "u3",
      name: "Charlie",
      email: "charlie@example.com",
      password: hashedPassword,
    },
  });

  // 2. Create Apartment
  const apartment = await prisma.apartment.create({
    data: {
      id: "a1",
      name: "Downtown Loft",
      inviteLinkToken: "invite-token-123",
      plan: "PRO",
    },
  });

  // 3. Create Apartment Members
  await prisma.apartmentMember.createMany({
    data: [
      { apartmentId: "a1", userId: "u1" },
      { apartmentId: "a1", userId: "u2" },
      { apartmentId: "a1", userId: "u3" },
    ],
  });

  // 4. Create Expenses
  // e1: Internet Bill ($60.00) - Alice paid, split equally among 3
  await prisma.expense.create({
    data: {
      id: "e1",
      apartmentId: "a1",
      creatorId: "u1",
      description: "Internet Bill",
      totalAmount: 6000,
      splitType: SplitType.EQUAL,
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 6000, amountOwed: 2000 },
            { userId: "u2", amountPaid: 0, amountOwed: 2000 },
            { userId: "u3", amountPaid: 0, amountOwed: 2000 },
          ],
        },
      },
    },
  });

  // e2: Groceries ($120.50) - Bob paid, split equally
  await prisma.expense.create({
    data: {
      id: "e2",
      apartmentId: "a1",
      creatorId: "u2",
      description: "Groceries",
      totalAmount: 12050,
      splitType: SplitType.EQUAL,
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 0, amountOwed: 4017 },
            { userId: "u2", amountPaid: 12050, amountOwed: 4016 },
            { userId: "u3", amountPaid: 0, amountOwed: 4017 },
          ],
        },
      },
    },
  });

  // e3: Electricity ($90.00) - Charlie paid, split equally
  await prisma.expense.create({
    data: {
      id: "e3",
      apartmentId: "a1",
      creatorId: "u3",
      description: "Electricity",
      totalAmount: 9000,
      splitType: SplitType.EQUAL,
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 0, amountOwed: 3000 },
            { userId: "u2", amountPaid: 0, amountOwed: 3000 },
            { userId: "u3", amountPaid: 9000, amountOwed: 3000 },
          ],
        },
      },
    },
  });

  // e4: Pizza Night ($45.00) - Alice paid, split exact (Bob owes 2000, Charlie owes 2500, Alice owes 0)
  await prisma.expense.create({
    data: {
      id: "e4",
      apartmentId: "a1",
      creatorId: "u1",
      description: "Pizza Night",
      totalAmount: 4500,
      splitType: SplitType.EXACT,
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 4500, amountOwed: 0 },
            { userId: "u2", amountPaid: 0, amountOwed: 2000 },
            { userId: "u3", amountPaid: 0, amountOwed: 2500 },
          ],
        },
      },
    },
  });

  // e5: Cleaning Supplies ($30.00) - Bob paid, split percentage (Alice 50%, Bob 50%, Charlie 0%)
  await prisma.expense.create({
    data: {
      id: "e5",
      apartmentId: "a1",
      creatorId: "u2",
      description: "Cleaning Supplies",
      totalAmount: 3000,
      splitType: SplitType.PERCENTAGE,
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 0, amountOwed: 1500 },
            { userId: "u2", amountPaid: 3000, amountOwed: 1500 },
            { userId: "u3", amountPaid: 0, amountOwed: 0 },
          ],
        },
      },
    },
  });

  // 5. Create Settlement
  // Charlie pays Alice $15.00
  await prisma.settlement.create({
    data: {
      id: "s1",
      apartmentId: "a1",
      payerId: "u3",
      payeeId: "u1",
      amount: 1500,
    },
  });

  // 6. Pre-seed V2 Comments
  await prisma.comment.createMany({
    data: [
      {
        expenseId: "e1",
        userId: "u2", // Bob
        content: "Did the internet plan change? It seems $5 more than last month.",
      },
      {
        expenseId: "e1",
        userId: "u1", // Alice
        content: "Yes, they increased the base speed. I think it's worth it!",
      },
      {
        expenseId: "e2",
        userId: "u3", // Charlie
        content: "Thanks for grabbing groceries Bob! The sourdough was amazing.",
      }
    ]
  });

  // 7. Pre-seed V2 Split Templates
  await prisma.splitTemplate.create({
    data: {
      id: "t1",
      name: "Rent 40/40/20",
      apartmentId: "a1",
      creatorId: "u1",
      splits: JSON.stringify([
        { userId: "u1", percent: 40 },
        { userId: "u2", percent: 40 },
        { userId: "u3", percent: 20 },
      ])
    }
  });

  // 8. Pre-seed a Recurring Expense template for lazy-cron demo
  // Next month rent template (marked isRecurring, next recurring on Aug 1, 2026)
  await prisma.expense.create({
    data: {
      id: "rec1",
      apartmentId: "a1",
      creatorId: "u1",
      description: "Monthly Rent (Auto)",
      totalAmount: 150000, // $1500.00
      splitType: SplitType.PERCENTAGE,
      isRecurring: true,
      nextRecurringDate: new Date("2026-08-01T00:00:00.000Z"), // Ready to trigger on Aug 1, 2026
      recurringInterval: "MONTHLY",
      participants: {
        createMany: {
          data: [
            { userId: "u1", amountPaid: 150000, amountOwed: 60000 }, // 40%
            { userId: "u2", amountPaid: 0, amountOwed: 60000 },      // 40%
            { userId: "u3", amountPaid: 0, amountOwed: 30000 },      // 20%
          ],
        },
      },
    },
  });

  console.log("Database seeded successfully with V2 mock data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
