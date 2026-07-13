"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeCheckoutModal } from "./StripeCheckoutModal";
import { upgradeApartmentAction } from "@/app/actions";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function PaywallUpgradeModal({
  open,
  onOpenChange,
  apartmentId,
  tier,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartmentId: string;
  tier: "BASIC" | "PRO";
  onSuccess: () => void;
}) {
  const [stripeOpen, setStripeOpen] = useState(false);

  // Billing parameters
  const isBasic = tier === "BASIC";
  
  // 1st month trial is free! So we charge a $1.00 verification check today
  const upgradeCostCents = 100; // $1.00 USD in cents
  const costUSD = isBasic ? "$5.00" : "$12.00";
  const rateUSD = isBasic ? "$2.50" : "$4.00";

  const handleUpgradeSuccess = async () => {
    try {
      await upgradeApartmentAction(apartmentId, tier);
      toast.success(`30-Day Free Trial Activated for Rentify ${isBasic ? "Basic" : "Pro"}!`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to start trial.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-[90%] rounded-2xl relative overflow-hidden p-6 select-none">
          <div className="absolute top-0 right-0 bg-[#82d0ad]/10 border-b border-l border-[#82d0ad]/20 px-3 py-1 text-[9px] font-bold text-[#82d0ad] rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> 1-Month Free Trial
          </div>

          <DialogHeader className="items-center text-center mt-4">
            <div className="h-14 w-14 bg-[#82d0ad]/10 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-[#82d0ad]" />
            </div>
            <DialogTitle className="text-xl font-black text-zinc-100">Start 30-Day Trial</DialogTitle>
            <p className="text-xs text-zinc-450 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Unlock Rentify {isBasic ? "Basic" : "Pro"}. Try free for 30 days, cancel anytime.
            </p>
          </DialogHeader>

          {/* Pricing Details */}
          <div className="my-5 p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3.5 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Pricing Tier:</span>
              <span className="text-zinc-200 font-bold">{rateUSD} / roommate / month</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450 font-medium">Due Today (Trial Setup):</span>
              <span className="text-[#82d0ad] font-bold">$1.00 USD (Fully Refundable)</span>
            </div>
            <div className="border-t border-zinc-850 pt-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-100">Monthly Cost (After 30 days)</p>
                <p className="text-[10px] text-zinc-500 font-medium">Cancel before trial ends</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-white">{costUSD} / month</p>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-[#82d0ad] shrink-0" />
              <span>Free 30-day access to all features</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-[#82d0ad] shrink-0" />
              <span>Native Stripe & automated settlements</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStripeOpen(true)}
            className="w-full h-13 bg-[#82d0ad] text-zinc-950 hover:bg-[#71bda0] font-black rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-[0_0_30px_-5px_rgba(130,208,173,0.25)]"
          >
            Start Free Trial ($1 Auth Check)
          </button>

          <p className="text-[9px] text-zinc-550 text-center flex items-center justify-center gap-1 mt-5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#82d0ad]" /> Secure verification powered by Stripe Connect.
          </p>
        </DialogContent>
      </Dialog>

      {/* Stripe Gateway Portal */}
      {stripeOpen && (
        <StripeCheckoutModal
          open={stripeOpen}
          onOpenChange={setStripeOpen}
          amount={upgradeCostCents}
          payeeName={`Rentify ${isBasic ? "Basic" : "Pro"} Trial`}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
}
