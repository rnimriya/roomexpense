import { getDashboardData } from "@/lib/dbQueries";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(cents) / 100);
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id || "u1"; // Fallback to Alice if id is missing

  const { netBalance, peerBalances, recentActivity, users } = await getDashboardData(currentUserId);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-50">
      {/* Header section with massive typography */}
      <div className="pt-16 pb-8 px-6 text-center">
        <p className="text-sm font-medium text-zinc-400 mb-2 tracking-wide uppercase">
          {session.user.name || "Your"}'s Balance
        </p>
        <h1 className={`text-6xl font-black tracking-tighter ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {netBalance < 0 ? '-' : ''}{formatCurrency(netBalance)}
        </h1>
        <p className="text-sm text-zinc-500 mt-3 font-medium">
          {netBalance > 0 ? "You are owed" : netBalance < 0 ? "You owe" : "You're all settled up"}
        </p>
      </div>

      <Separator className="bg-zinc-900" />

      <ScrollArea className="flex-1">
        {/* Who Owes Who Section */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-100">Roommate Balances</h2>
            <Link href="/settle" className="text-xs font-semibold text-green-500 hover:text-green-400 transition-colors uppercase tracking-wider bg-green-500/10 px-3 py-1.5 rounded-full">
              Settle Up
            </Link>
          </div>
          
          <div className="space-y-4">
            {peerBalances.filter(pb => pb.amount !== 0).length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">All settled up with everyone!</p>
            ) : (
              peerBalances.filter(pb => pb.amount !== 0).map(pb => {
                const peerUser = users.find(u => u.id === pb.userId);
                return (
                  <Card key={pb.userId} className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-zinc-800">
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold">
                            {peerUser?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-zinc-100">{peerUser?.name}</p>
                          <p className="text-xs text-zinc-400 font-medium mt-0.5">
                            {pb.amount > 0 ? "Owes you" : "You owe"}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${pb.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(pb.amount)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="px-6 pb-20">
          <h2 className="text-lg font-bold text-zinc-100 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => {
              if (activity.type === 'expense') {
                const expense = activity.data;
                const creator = users.find(u => u.id === expense.creatorId);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <ArrowDownLeft className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100 text-sm">{expense.description}</p>
                        <p className="text-xs text-zinc-500">{creator?.name || "Someone"} paid {formatCurrency(expense.totalAmount)}</p>
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
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100 text-sm">Payment</p>
                        <p className="text-xs text-zinc-500">{payer?.name || "Someone"} paid {payee?.name || "Someone"}</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-300">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
