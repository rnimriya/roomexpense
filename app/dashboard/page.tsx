import { getDashboardData } from "@/lib/dbQueries";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet } from "lucide-react";
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
    <div className="flex flex-col h-full bg-[#121212] text-zinc-50">
      {/* Brand Navigation Bar - Structured Top Header */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-[#121212]/80 backdrop-blur-md z-40 shrink-0">
        <h1 className="text-lg font-black tracking-widest text-zinc-100 uppercase">
          FairShare
        </h1>
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
              <p className="text-[10px] text-zinc-450 leading-relaxed mt-1">
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

        {/* Balance Wallet Card - Klove Inspired */}
        <div className="pt-6 px-6 pb-2">
          <div className="bg-[#1c1c1e] border border-zinc-850 rounded-[28px] p-6 relative overflow-hidden shadow-xl shadow-black/45">
            {/* Shimmer overlay */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-1.5 text-zinc-450 text-xs font-bold uppercase tracking-wider">
                <Wallet className="h-4 w-4" /> Wallet
              </div>
              <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-450 text-sm font-bold select-none cursor-pointer hover:bg-zinc-850 transition-colors">
                +
              </div>
            </div>

            <div className="mb-4 relative z-10">
              <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider mb-1">
                Main Balance
              </p>
              <h1 className={`text-4xl font-black tracking-tight ${
                netBalance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {netBalance < 0 ? '-' : ''}{formatCurrency(netBalance)}
              </h1>
            </div>

            <div className="flex justify-between items-end mt-8 relative z-10">
              <div>
                <p className="text-[10px] text-zinc-450 font-extrabold uppercase tracking-widest">
                  {session.user.name || "Roommate"}
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                  {netBalance > 0 ? "Owed overall" : netBalance < 0 ? "You owe overall" : "All settled up"}
                </p>
              </div>
              
              {/* Card brand icons - mock Mastercard circles logo */}
              <div className="flex -space-x-1.5 select-none opacity-85">
                <div className="h-5 w-5 rounded-full bg-[#ff5f00]" />
                <div className="h-5 w-5 rounded-full bg-[#f79e1b]/90" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Send / Receive) - Klove Inspired */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-2 gap-3.5">
            <Link href="/settle" className="bg-[#1c1c1e] hover:bg-[#242426] border border-zinc-850 rounded-[24px] p-4.5 flex flex-col justify-between h-28 transition-all active:scale-95 group">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-850 transition-colors">
                <ArrowUpRight className="h-4.5 w-4.5 text-zinc-100" />
              </div>
              <span className="text-xs font-black text-zinc-350">Send / Settle</span>
            </Link>
            <Link href="/expense/new" className="bg-[#1c1c1e] hover:bg-[#242426] border border-zinc-850 rounded-[24px] p-4.5 flex flex-col justify-between h-28 transition-all active:scale-95 group">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-850 transition-colors">
                <ArrowDownLeft className="h-4.5 w-4.5 text-zinc-100" />
              </div>
              <span className="text-xs font-black text-zinc-350">Add Expense</span>
            </Link>
          </div>
        </div>

        <Separator className="bg-zinc-900/50 my-2" />

        {/* Monthly Summary Banner */}
        <div className="pt-6">
          <MonthlySummaryCard 
            activities={serializedRecentActivity} 
            currentUserId={currentUserId} 
            users={serializedUsers} 
          />
        </div>

        {/* Who Owes Who Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">Roommates</h2>
            <div className="flex gap-2">
              <Link href="/roommates" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Manage
              </Link>
              <Link href="/settle" className="text-[10px] font-bold text-green-500 hover:text-green-400 transition-colors uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Settle Up
              </Link>
            </div>
          </div>
          
          <div className="space-y-3.5">
            {peerBalances.filter(pb => pb.amount !== 0).map(pb => {
              const peerUser = users.find(u => u.id === pb.userId);
              return (
                <Card key={pb.userId} className="bg-zinc-900/30 border-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-900/40 transition-colors duration-250">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-10 w-10 border border-zinc-800">
                        <AvatarFallback className="bg-zinc-900 text-zinc-300 font-bold text-xs">
                          {peerUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-zinc-200 text-sm">{peerUser?.name}</p>
                        <p className="text-[10px] text-zinc-550 font-medium mt-0.5">
                          {pb.amount > 0 ? "Owes you" : "You owe"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {pb.amount > 0 && (
                        <NudgeButton 
                          senderId={currentUserId}
                          recipientId={pb.userId}
                          amountCents={pb.amount}
                        />
                      )}
                      <div className={`text-base font-black ${pb.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(pb.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Dash placeholder to Add or Invite Roommates */}
            <Card className="bg-zinc-950 border border-dashed border-zinc-850 rounded-2xl overflow-hidden hover:bg-zinc-900/20 transition-all duration-250 cursor-pointer active:scale-98">
              <Link href="/roommates">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-zinc-400 text-lg">
                      <Plus className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-300 text-sm">Add or Invite Roommates</p>
                      <p className="text-[10px] text-zinc-550 font-medium mt-0.5">
                        Add profiles directly or share invite link
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
        <div className="px-6 pb-24 pt-4">
          <h2 className="text-base font-bold text-zinc-100 mb-4 tracking-tight">Recent Activity</h2>
          <div className="space-y-3.5">
            {recentActivity.map((activity, idx) => {
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
                        <p className="text-[10px] text-zinc-550 mt-0.5">Paid by {creator?.name || "Someone"}</p>
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
    </div>
  );
}
