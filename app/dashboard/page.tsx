import { getDashboardData } from "@/lib/dbQueries";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Plus, Send, TrendingUp } from "lucide-react";
import { lazyTriggerRecurringExpenses, lazyTriggerMonthlySummaryEmail } from "@/app/actions";
import { NudgeButton } from "@/components/NudgeButton";
import { NotificationsBell } from "@/components/NotificationsBell";
import { MonthlySummaryCard } from "@/components/MonthlySummaryCard";
import { SimplifiedDebtsCard } from "@/components/SimplifiedDebtsCard";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(cents) / 100);
};

export default async function DashboardPage(props: { searchParams: Promise<{ error?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const searchParams = await props.searchParams;
  const isPaywallError = searchParams?.error && searchParams.error.includes("PAYWALL");

  // Run lazy-cron checks
  try {
    await lazyTriggerRecurringExpenses();
    await lazyTriggerMonthlySummaryEmail();
  } catch (err) {
    console.error("Failed to run lazy cron checks", err);
  }

  const currentUserId = (session.user as any).id || "u1";

  const { netBalance, peerBalances, recentActivity, users, simplifiedDebts } = await getDashboardData(currentUserId);

  // Serialize recent activity and users to avoid client-side date transfer errors
  const serializedRecentActivity = recentActivity.map(act => ({
    ...act,
    date: act.date.toISOString(),
    data: {
      ...act.data,
      createdAt: act.data.createdAt.toISOString(),
      updatedAt: act.data.updatedAt.toISOString(),
    }
  }));

  const serializedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  const serializedSimplifiedDebts = simplifiedDebts.map(d => ({
    debtor: d.debtor,
    creditor: d.creditor,
    amount: d.amount,
  }));

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative">
      {/* Brand Navigation Bar - Mock 3 */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-[#3a8469]/20">
            <AvatarFallback className="bg-zinc-900 text-[#3a8469] font-bold text-xs">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-base font-black tracking-wide text-white">
            <span className="text-[#3a8469]">Roomie</span>Pay
          </h1>
        </div>
        <NotificationsBell 
          activities={serializedRecentActivity} 
          currentUserId={currentUserId}
          users={serializedUsers}
        />
      </div>

      <ScrollArea className="flex-1">
        {/* Marketing SaaS paywall block alert */}
        {isPaywallError && (
          <div className="mx-6 mt-4 p-4.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Upgrade Required</p>
              <p className="text-[10px] text-zinc-455 leading-relaxed mt-1">
                A roommate tried to join your group via invite link but was blocked. Free apartments are limited to 2 roommates.
              </p>
            </div>
            <Link 
              href="/roommates" 
              className="text-[10px] font-bold text-white bg-[#0584eb] hover:bg-[#2094f0] px-4 py-2 rounded-full uppercase tracking-wider shrink-0 transition-colors shadow-[0_0_15px_-3px_rgba(5,132,235,0.4)]"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Balance Wallet Card - Mock 3 */}
        <div className="pt-6 px-6 pb-2">
          <div className="bg-[#181a1b] border border-zinc-900 rounded-[28px] p-6 relative overflow-hidden shadow-xl shadow-black/45">
            {/* Shimmer overlay */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-6 relative z-10 text-left">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">
                TOTAL BALANCE
              </p>
              <h1 className={`text-4.5xl font-black tracking-tight ${
                netBalance >= 0 ? 'text-[#3a8469]' : 'text-red-500'
              }`}>
                {netBalance < 0 ? '-' : ''}{formatCurrency(netBalance)}
              </h1>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#3a8469]" /> Up 12% from last month
              </p>
            </div>

            {/* Quick Action Button Actions inside card - Mock 3 */}
            <div className="flex gap-3 relative z-10">
              <Link 
                href="/settle"
                className="flex-1 h-11 bg-[#3a8469] text-zinc-950 hover:bg-[#2f6c56] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </Link>
              <Link 
                href="/expense/new"
                className="flex-1 h-11 bg-[#242627] hover:bg-[#2c2f30] border border-zinc-900 text-zinc-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-zinc-400" /> Expense
              </Link>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-900/50 my-2" />

        {/* Monthly Summary Banner - Mock 3 */}
        <div className="pt-4">
          <MonthlySummaryCard 
            activities={serializedRecentActivity} 
            currentUserId={currentUserId} 
            users={serializedUsers} 
          />
        </div>

        {/* Roommates List Section - Mock 3 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">Roommates</h2>
            <Link href="/roommates" className="text-[10px] font-bold text-zinc-450 hover:text-zinc-200 transition-colors uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform">
              Manage
            </Link>
          </div>
          
          <div className="space-y-3.5">
            {peerBalances.filter(pb => pb.amount !== 0).map(pb => {
              const peerUser = users.find(u => u.id === pb.userId);
              return (
                <Card key={pb.userId} className="bg-[#181a1b] border-zinc-900 rounded-[20px] overflow-hidden hover:bg-[#1f2122] transition-colors duration-250">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-left">
                      <Avatar className="h-10 w-10 border border-zinc-800">
                        <AvatarFallback className="bg-zinc-900 text-[#3a8469] font-bold text-xs">
                          {peerUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-zinc-150 text-sm leading-tight">{peerUser?.name}</p>
                        <p className="text-[10px] text-zinc-450 font-medium mt-0.5">
                          {pb.amount > 0 ? `Owes you ${formatCurrency(pb.amount)}` : `You owe ${formatCurrency(pb.amount)}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href="/settle"
                        className="bg-[#3a8469]/10 hover:bg-[#3a8469]/20 text-[#3a8469] text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all"
                      >
                        SETTLE
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add or Invite Roommates box placeholder */}
            <Card className="bg-[#0c0e0e] border border-dashed border-zinc-850 rounded-[20px] overflow-hidden hover:bg-zinc-900/10 transition-all duration-250 cursor-pointer active:scale-98">
              <Link href="/roommates">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="h-10 w-10 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-zinc-400">
                      <Plus className="h-4 w-4 text-[#3a8469]" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-350 text-sm">Add or Invite Roommates</p>
                      <p className="text-[10px] text-zinc-550 font-medium mt-0.5">
                        Create phantom profiles or share links
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <SimplifiedDebtsCard 
              simplifiedDebts={serializedSimplifiedDebts} 
              users={serializedUsers} 
            />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="px-6 pb-28 pt-4">
          <h2 className="text-base font-bold text-zinc-100 mb-4 tracking-tight">Recent Activity</h2>
          <div className="space-y-3.5">
            {recentActivity.map((activity, idx) => {
              if (activity.type === 'expense') {
                const expense = activity.data;
                const creator = users.find(u => u.id === expense.creatorId);
                return (
                  <Link key={idx} href={`/expense/${expense.id}`} className="flex items-center justify-between hover:bg-[#181a1b]/40 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center">
                        <ArrowDownLeft className="h-4 w-4 text-zinc-550" />
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
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-[#3a8469]" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200 text-sm">Payment</p>
                        <p className="text-[10px] text-zinc-550 mt-0.5">{payer?.name || "Someone"} paid {payee?.name || "Someone"}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-400">
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Floating Add Capsule FAB - Mock 3 */}
      <Link 
        href="/expense/new"
        className="fixed bottom-22 right-5 z-40 bg-[#3a8469] text-zinc-950 shadow-xl px-4.5 py-2.5 rounded-full flex items-center justify-center gap-1 font-black text-[10px] tracking-wider uppercase active:scale-95 transition-all select-none border border-zinc-900/50 hover:bg-[#2f6c56]"
      >
        <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add
      </Link>
    </div>
  );
}
