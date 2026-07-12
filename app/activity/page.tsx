import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
  });
  const settlements = await prisma.settlement.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Combine all expenses and settlements, sort by date descending
  const allActivity = [
    ...expenses.map(e => ({ type: 'expense' as const, date: e.createdAt, data: e })),
    ...settlements.map(s => ({ type: 'settlement' as const, date: s.createdAt, data: s }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-50">
      {/* Header section */}
      <div className="pt-16 pb-6 px-6">
        <h1 className="text-3xl font-black tracking-tighter text-zinc-100">Activity</h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">All group transactions</p>
      </div>

      <Separator className="bg-zinc-900" />

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 pb-24">
          <div className="space-y-6">
            {allActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No activity recorded yet.</p>
            ) : (
              allActivity.map((activity, idx) => {
                if (activity.type === 'expense') {
                  const expense = activity.data;
                  const creator = users.find(u => u.id === expense.creatorId);
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <ArrowDownLeft className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-base">{expense.description}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{creator?.name || "Someone"} paid {formatCurrency(expense.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const settlement = activity.data;
                  const payer = users.find(u => u.id === settlement.payerId);
                  const payee = users.find(u => u.id === settlement.payeeId);
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-base">Payment</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{payer?.name || "Someone"} paid {payee?.name || "Someone"}</p>
                        </div>
                      </div>
                      <div className="text-base font-bold text-zinc-300">
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
