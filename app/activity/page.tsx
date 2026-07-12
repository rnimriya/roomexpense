import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import Link from "next/link";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(cents) / 100);
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const users = await prisma.user.findMany();
  
  // Exclude soft deleted expenses and templates from activity list
  const expenses = await prisma.expense.findMany({
    where: {
      isDeleted: false,
      isRecurring: false,
    },
    orderBy: { createdAt: "desc" },
  });
  
  const settlements = await prisma.settlement.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Combine and sort by date descending
  const allActivity = [
    ...expenses.map(e => ({ type: 'expense' as const, date: e.createdAt, data: e })),
    ...settlements.map(s => ({ type: 'settlement' as const, date: s.createdAt, data: s }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Serialize dates to prevent Next.js server-to-client transfer errors
  const serializedActivity = allActivity.map(act => ({
    ...act,
    date: act.date.toISOString(),
    data: {
      ...act.data,
      createdAt: act.data.createdAt.toISOString(),
      updatedAt: act.data.updatedAt.toISOString(),
      // handle optional nextRecurringDate
      nextRecurringDate: (act.data as any).nextRecurringDate ? ((act.data as any).nextRecurringDate as Date).toISOString() : null,
    }
  }));

  const serializedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-50">
      {/* Brand Navigation Bar - Consistent styled header */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-40 shrink-0">
        <h1 className="text-lg font-black tracking-widest text-zinc-100 uppercase">
          Activity
        </h1>
        <ExportCSVButton activities={serializedActivity} users={serializedUsers} />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 pb-24">
          <div className="space-y-4">
            {allActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8 italic">No activity recorded yet.</p>
            ) : (
              allActivity.map((activity, idx) => {
                if (activity.type === 'expense') {
                  const expense = activity.data;
                  const creator = users.find(u => u.id === expense.creatorId);
                  return (
                    <Link key={idx} href={`/expense/${expense.id}`} className="flex items-center justify-between hover:bg-zinc-900/30 p-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center">
                          <ArrowDownLeft className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm">{expense.description}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Paid by {creator?.name || "Someone"}</p>
                        </div>
                      </div>
                      <div className="text-sm font-black text-zinc-200">
                        {formatCurrency(expense.totalAmount)}
                      </div>
                    </Link>
                  );
                } else {
                  const settlement = activity.data;
                  const payer = users.find(u => u.id === settlement.payerId);
                  const payee = users.find(u => u.id === settlement.payeeId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm">Payment</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{payer?.name || "Someone"} paid {payee?.name || "Someone"}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-zinc-400">
                        {formatCurrency(settlement.amount)}
                      </div>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
