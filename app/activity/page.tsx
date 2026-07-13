import { prisma } from "@/lib/prisma";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Receipt, Pizza, Utensils, Droplet, Landmark, ShoppingCart, Bell } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Format cents to dollars
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(cents) / 100);
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const currentUserId = (session.user as any).id || "u1";
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
      nextRecurringDate: (act.data as any).nextRecurringDate ? ((act.data as any).nextRecurringDate as Date).toISOString() : null,
    }
  }));

  const serializedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  // Group activities dynamically by date categories (TODAY, YESTERDAY, PAST MONTH)
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const todayActivities: typeof allActivity = [];
  const yesterdayActivities: typeof allActivity = [];
  const pastActivities: typeof allActivity = [];

  for (const act of allActivity) {
    const actStr = act.date.toDateString();
    if (actStr === todayStr) {
      todayActivities.push(act);
    } else if (actStr === yesterdayStr) {
      yesterdayActivities.push(act);
    } else {
      pastActivities.push(act);
    }
  }

  // Determine icon layout metadata from description matching
  const getIconData = (description: string, type: 'expense' | 'settlement') => {
    if (type === 'settlement') {
      return { icon: ArrowUpRight, label: "transfer", color: "text-[#82d0ad]" };
    }
    const desc = description.toLowerCase();
    if (desc.includes("pizza") || desc.includes("night")) {
      return { icon: Pizza, label: "local_pizza", color: "text-red-400" };
    }
    if (desc.includes("dinner") || desc.includes("food") || desc.includes("party")) {
      return { icon: Utensils, label: "restaurant", color: "text-orange-400" };
    }
    if (desc.includes("water") || desc.includes("bill") || desc.includes("wifi")) {
      return { icon: Droplet, label: "water_drop", color: "text-blue-400" };
    }
    if (desc.includes("rent") || desc.includes("management") || desc.includes("deposit")) {
      return { icon: Landmark, label: "account_balance", color: "text-green-400" };
    }
    return { icon: ShoppingCart, label: "shopping_cart", color: "text-zinc-400" };
  };

  const renderActivityCard = (act: typeof allActivity[0], idx: number) => {
    const isExpense = act.type === 'expense';
    
    if (isExpense) {
      const expense = act.data as any;
      const creator = users.find(u => u.id === expense.creatorId);
      const isPaidByMe = expense.creatorId === currentUserId;
      const iconInfo = getIconData(expense.description, 'expense');
      const IconComp = iconInfo.icon;
      
      return (
        <Link 
          key={idx} 
          href={`/expense/${expense.id}`} 
          className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative h-11 w-11 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center shrink-0">
              <IconComp className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-zinc-150 text-sm leading-tight truncate">{expense.description}</p>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Paid by {isPaidByMe ? "You" : (creator?.name || "Roommate")}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-base font-black ${isPaidByMe ? 'text-[#82d0ad]' : 'text-zinc-200'}`}>
              {isPaidByMe ? '+' : '-'}{formatCurrency(expense.totalAmount)}
            </p>
            <p className="text-[9px] text-zinc-500 mt-0.5">
              {new Date(act.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </Link>
      );
    } else {
      const settlement = act.data as any;
      const payer = users.find(u => u.id === settlement.payerId);
      const payee = users.find(u => u.id === settlement.payeeId);
      const isPaidByMe = settlement.payerId === currentUserId;
      const iconInfo = getIconData("payment", 'settlement');
      const IconComp = iconInfo.icon;

      return (
        <div 
          key={idx} 
          className="bg-[#181a1b] border border-zinc-900 rounded-[20px] p-4.5 flex items-center justify-between hover:bg-[#1f2122] transition-colors text-left"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative h-11 w-11 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center shrink-0">
              <IconComp className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-zinc-150 text-sm leading-tight truncate">Settle Up Payment</p>
              <p className="text-[10px] text-zinc-550 mt-0.5">
                {isPaidByMe ? `Paid by You` : `Paid by ${payer?.name || "Roommate"}`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-base font-black ${!isPaidByMe ? 'text-[#82d0ad]' : 'text-zinc-200'}`}>
              {!isPaidByMe ? '+' : '-'}{formatCurrency(settlement.amount)}
            </p>
            <p className="text-[9px] text-zinc-550 mt-0.5">
              {new Date(act.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0e0e] text-zinc-50 relative pb-24">
      {/* Brand Navigation Bar - Structured Top Header */}
      <div className="pt-8 pb-4 px-6 flex justify-between items-center border-b border-zinc-900 bg-[#0c0e0e]/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-[#82d0ad]/20">
            <AvatarFallback className="bg-zinc-900 text-[#82d0ad] font-bold text-xs">
              U
            </AvatarFallback>
          </Avatar>
          <h1 className="text-base font-black tracking-wide text-white">
            <span className="text-[#82d0ad]">Roomie</span>Pay
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ExportCSVButton activities={serializedActivity} users={serializedUsers} />
          <button 
            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 tracking-wider flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6">
          
          {/* TODAY Section */}
          {todayActivities.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-[0.2em] text-left">
                TODAY
              </h3>
              {todayActivities.map((act, idx) => renderActivityCard(act, idx))}
            </div>
          )}

          {/* YESTERDAY Section */}
          {yesterdayActivities.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-[0.2em] text-left">
                YESTERDAY
              </h3>
              {yesterdayActivities.map((act, idx) => renderActivityCard(act, idx))}
            </div>
          )}

          {/* PAST ACTIVITIES Section */}
          {pastActivities.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-[0.2em] text-left">
                PAST ACTIVITIES
              </h3>
              {pastActivities.map((act, idx) => renderActivityCard(act, idx))}
            </div>
          )}

          {allActivity.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-zinc-550 italic">No activity recorded this month.</p>
            </div>
          )}

          {/* Bottom Dash End of History Card - Mock 1 */}
          <div className="border border-dashed border-zinc-850 rounded-[24px] p-8 text-center bg-[#0c0e0e] my-4 select-none">
            <h4 className="text-zinc-700 font-extrabold text-xl tracking-[0.15em] uppercase">history</h4>
            <p className="text-[10px] text-zinc-550 mt-1 leading-relaxed">End of history for this month</p>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
