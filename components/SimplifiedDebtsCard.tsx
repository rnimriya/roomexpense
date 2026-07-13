"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function SimplifiedDebtsCard({
  simplifiedDebts,
  users,
}: {
  simplifiedDebts: any[];
  users: any[];
}) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <Card className="bg-zinc-900/30 border-zinc-900 rounded-2xl overflow-hidden mt-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-green-500" /> Simplified Group Debts
          </h3>
          <span className="text-[8px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Optimized
          </span>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="flex items-center gap-2.5 py-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-xs text-zinc-450 italic font-medium">All roommate ledger balances are settled!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {simplifiedDebts.map((debt, idx) => {
              const debtor = users.find(u => u.id === debt.debtor);
              const creditor = users.find(u => u.id === debt.creditor);
              return (
                <div key={idx} className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                    <span className="font-bold text-zinc-100">{debtor?.name || "Roommate"}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-650" />
                    <span className="font-bold text-zinc-100">{creditor?.name || "Roommate"}</span>
                  </div>
                  <div className="text-sm font-black text-green-500">
                    {formatCurrency(debt.amount)}
                  </div>
                </div>
              );
            })}
            <p className="text-[9px] text-zinc-550 leading-relaxed pt-1.5 italic">
              Rentify runs a greedy network flow algorithm. Instead of multiple Venmo trades, settle up using these simplified paths.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
