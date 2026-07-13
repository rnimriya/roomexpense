import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MonthlySummaryCard } from "@/components/MonthlySummaryCard";
import { Plus, ArrowUpRight, ArrowDownLeft, Receipt, UserPlus, TrendingUp, Bell } from "lucide-react";

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

  const currentUserId = (session.user as any).id || "u1";

  // Load user with apartment members
  const userWithApartments = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      apartmentMembers: {
        include: {
          apartment: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
              expenses: {
                where: { isDeleted: false },
                include: {
                  creator: true,
                  participants: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const memberInfo = userWithApartments?.apartmentMembers?.[0];
  const apartment = memberInfo?.apartment;

  if (!apartment) {
    redirect("/apartment/new");
  }

  // Calculate balances
  const users = apartment.members.map((m) => m.user);
  const activeExpenses = apartment.expenses;

  // Track debt matrices
  let balances: { [userId: string]: number } = {};
  users.forEach((u) => {
    balances[u.id] = 0;
  });

  activeExpenses.forEach((exp) => {
    const creatorId = exp.creatorId;
    const participants = exp.participants;
    
    participants.forEach((part) => {
      const debtorId = part.userId;
      const owed = part.amountOwed;
      
      if (debtorId === creatorId) {
        // Creator paid and owes their share
        balances[creatorId] -= (exp.totalAmount - owed);
      } else {
        // Debtor owes money to creator
        balances[debtorId] += owed;
        balances[creatorId] -= owed;
      }
    });
  });

  const netBalance = -(balances[currentUserId] || 0);

  // Find who owes what
  const roomiesToOwe = users
    .filter((u) => u.id !== currentUserId)
    .map((u) => {
      const uBalance = balances[u.id] || 0;
      const myBalance = balances[currentUserId] || 0;
      
      // Calculate split diff
      let share = 0;
      if (uBalance > 0 && myBalance < 0) {
        share = Math.min(Math.abs(myBalance), uBalance);
      } else if (uBalance < 0 && myBalance > 0) {
        share = -Math.min(myBalance, Math.abs(uBalance));
      }
      return { user: u, share };
    })
    .filter((r) => Math.abs(r.share) > 0);

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Header - Mock 3 */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-[#82d0ad]/20 overflow-hidden relative">
            {userWithApartments?.image && (
              <img src={userWithApartments.image} alt={session.user.name || "User"} className="h-full w-full object-cover rounded-full" />
            )}
            <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-base font-black tracking-wide text-white">
            <span className="text-[#82d0ad]">Roomie</span>Pay
          </h1>
        </div>
        <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 tracking-wider flex items-center gap-1">
          <Bell className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6 text-left">
          {/* Dashboard Balance Container - Mock 3 */}
          <div className="bg-[#181a1b] border border-zinc-900 rounded-[28px] p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col space-y-5 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-1.5">
                    TOTAL BALANCE
                  </p>
                  <h2 className="text-3.5xl font-black text-[#82d0ad] tracking-tight leading-none">
                    {formatCurrency(netBalance)}
                  </h2>
                </div>
                <div className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  netBalance >= 0 ? 'bg-[#82d0ad]/10 text-[#82d0ad]' : 'bg-red-500/10 text-red-400'
                }`}>
                  <TrendingUp className={`h-3.5 w-3.5 ${netBalance >= 0 ? 'text-[#82d0ad]' : 'text-red-400'}`} /> Up 12% from last month
                </div>
              </div>

              {/* Action capsule links - Mock 3 */}
              <div className="flex gap-3 pt-2">
                <Link
                  href="/settle"
                  className="flex-1 h-11 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                >
                  <ArrowDownLeft className="h-4 w-4" /> Settle
                </Link>
                <Link
                  href="/expense/new"
                  className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl flex items-center justify-center gap-1.5 text-zinc-200 text-xs font-bold transition-all"
                >
                  <ArrowUpRight className="h-4 w-4" /> Expense
                </Link>
              </div>
            </div>
          </div>

          {/* Monthly summary statistics */}
          <MonthlySummaryCard
            activities={activeExpenses}
            currentUserId={currentUserId}
            users={users}
          />

          {/* Who Owes What section - Mock 3 */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
              people balances overview
            </h3>

            <div className="space-y-3">
              {roomiesToOwe.map(({ user: rUser, share }) => (
                <div 
                  key={rUser.id} 
                  className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-10 w-10 border border-zinc-800 overflow-hidden relative shrink-0">
                      {rUser.image && (
                        <img src={rUser.image} alt={rUser.name || "Roommate"} className="h-full w-full object-cover rounded-full" />
                      )}
                      <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
                        {rUser.name?.charAt(0) || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-extrabold text-zinc-150 text-sm leading-tight">{rUser.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                        {share > 0 ? "owes you money" : "you owe them money"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black tracking-tight ${
                      share > 0 ? 'text-[#82d0ad]' : 'text-orange-400'
                    }`}>
                      {formatCurrency(share)}
                    </span>
                  </div>
                </div>
              ))}

              {roomiesToOwe.length === 0 && (
                <div className="bg-[#181a1b] border border-zinc-900 border-dashed rounded-[20px] p-8 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 bg-[#82d0ad]/10 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-[#82d0ad]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-300 text-xs uppercase tracking-wider">No active debts</h4>
                    <p className="text-[9px] text-zinc-550 mt-1">Everyone in the apartment is settled up!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick transaction history */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                activity recent transactions
              </h3>
              <Link 
                href="/activity" 
                className="text-[10px] font-bold text-[#82d0ad] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {activeExpenses.slice(0, 3).map((exp) => (
                <Link 
                  key={exp.id} 
                  href={`/expense/${exp.id}`}
                  className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex justify-between items-center hover:bg-[#1f2122] transition-colors block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center shrink-0">
                      <Receipt className="h-4.5 w-4.5 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-zinc-150 text-xs uppercase tracking-wider">{exp.description}</h4>
                      <p className="text-[9px] text-zinc-500 mt-1 font-medium">
                        Paid by {exp.creator.name} • {new Date(exp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">
                      {formatCurrency(exp.totalAmount)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#82d0ad]" />
                  </div>
                </Link>
              ))}

              {activeExpenses.length === 0 && (
                <p className="text-zinc-550 text-xs text-center py-4">No recent expenses found.</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Floating Action Button (FAB) - Mock 3 */}
      <Link 
        href="/expense/new"
        className="fixed bottom-22 right-5 z-40 bg-[#82d0ad] text-zinc-950 shadow-xl px-4.5 py-2.5 rounded-full flex items-center justify-center gap-1 font-black text-[10px] tracking-wider uppercase active:scale-95 transition-all select-none border border-zinc-900/50 hover:bg-[#71bda0]"
      >
        <Plus className="h-4 w-4 stroke-[3]" /> Add
      </Link>
    </div>
  );
}
